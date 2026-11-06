/**
 * TD613 EMSTD613 Corpus Inspector and Manifest Generator
 * Commission EM E-00 · Deliverables 1, 3, 4, 8
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');
const EM_ROOT = path.resolve(REPO_ROOT, 'packages/dome_world_exact/fixtures/a15-r0/EMSTD613');

export function sha256Hex(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

export function parseJsonl(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return content.trim().split('\n').filter(line => line.trim().length > 0).map(line => JSON.parse(line));
}

export function parseZipCentralDirectory(zipPath) {
  const buf = fs.readFileSync(zipPath);
  const entries = [];
  let i = 0;
  while (i < buf.length - 4) {
    if (buf[i] === 0x50 && buf[i + 1] === 0x4b && buf[i + 2] === 0x01 && buf[i + 3] === 0x02) {
      const filenameLen = buf.readUInt16LE(i + 28);
      const extraLen = buf.readUInt16LE(i + 30);
      const commentLen = buf.readUInt16LE(i + 32);
      const uncompressedSize = buf.readUInt32LE(i + 24);
      const compressedSize = buf.readUInt32LE(i + 20);
      const filename = buf.subarray(i + 46, i + 46 + filenameLen).toString('utf8');
      const isMacOsx = filename.startsWith('__MACOSX/');
      entries.push({
        filename,
        uncompressed_size_bytes: uncompressedSize,
        compressed_size_bytes: compressedSize,
        is_macosx_sidecar: isMacOsx,
        entry_class: isMacOsx ? 'APPLEDOUBLE_METADATA_SIDECAR' : 'PRESERVED_DOCUMENT_MEMBER'
      });
      i += 46 + filenameLen + extraLen + commentLen;
    } else {
      i++;
    }
  }
  return entries;
}

export function inspectCorpus() {
  console.log('--- Inspecting EMSTD613 Historical Corpus ---');

  // 1. Audit 87 Sources
  const sourcesManifest = parseJsonl(path.join(EM_ROOT, '01-MANIFESTS/source-files.jsonl'));
  const auditedSources = [];
  let totalSourceBytes = 0;
  let sourceFormatCounts = {};

  for (const s of sourcesManifest) {
    const diskPath = path.join(EM_ROOT, s.archive_relative_path);
    if (!fs.existsSync(diskPath)) {
      throw new Error(`SOURCE_FILE_MISSING_ON_DISK: ${diskPath}`);
    }
    const rawBytes = fs.readFileSync(diskPath);
    const hash = sha256Hex(rawBytes);
    if (hash !== s.sha256 || rawBytes.length !== s.byte_length) {
      throw new Error(`SOURCE_INTEGRITY_DRIFT: ${s.source_file_id} expected ${s.sha256} got ${hash}`);
    }
    totalSourceBytes += rawBytes.length;
    const ext = s.extension || path.extname(s.original_filename);
    sourceFormatCounts[ext] = (sourceFormatCounts[ext] || 0) + 1;

    auditedSources.push({
      source_file_id: s.source_file_id,
      original_filename: s.original_filename,
      relative_path: s.relative_path,
      archive_relative_path: s.archive_relative_path,
      byte_length: rawBytes.length,
      sha256: hash,
      extension: ext,
      media_type: s.media_type,
      filesystem_clock_status: s.filesystem_clock_status,
      duplicate_of_source_file_id: s.duplicate_of_source_file_id,
      integrity_status: 'VERIFIED_EXACT'
    });
  }

  // 2. Audit 53 Extracted Derivatives (and 34 Unsupported Formats)
  const derivativesManifest = parseJsonl(path.join(EM_ROOT, '03-DERIVATIVES/derivative-index.jsonl'));
  const auditedDerivatives = [];
  let extractedCount = 0;
  let unsupportedCount = 0;

  for (const d of derivativesManifest) {
    if (d.extraction_status === 'EXTRACTED_NATIVE_TEXT') {
      const diskPath = path.join(EM_ROOT, d.derivative_relative_path);
      if (!fs.existsSync(diskPath)) {
        throw new Error(`DERIVATIVE_FILE_MISSING_ON_DISK: ${diskPath}`);
      }
      const rawBytes = fs.readFileSync(diskPath);
      const hash = sha256Hex(rawBytes);
      if (hash !== d.derivative_sha256 || rawBytes.length !== d.derivative_byte_length) {
        throw new Error(`DERIVATIVE_INTEGRITY_DRIFT: ${d.source_file_id} expected ${d.derivative_sha256} got ${hash}`);
      }
      extractedCount++;
      auditedDerivatives.push({
        source_file_id: d.source_file_id,
        derivative_relative_path: d.derivative_relative_path,
        extraction_status: d.extraction_status,
        extraction_tool: d.extraction_tool,
        byte_length: rawBytes.length,
        sha256: hash,
        parent_sha256: d.parent_sha256,
        is_retrievable_text: true
      });
    } else {
      unsupportedCount++;
      auditedDerivatives.push({
        source_file_id: d.source_file_id,
        derivative_relative_path: null,
        extraction_status: d.extraction_status,
        negative_state: d.negative_state,
        parent_sha256: d.parent_sha256,
        is_retrievable_text: false,
        exclusion_reason: d.negative_state === 'UNSUPPORTED_FORMAT'
          ? (d.source_file_id === 'emsrc_db43deb1f616beed44e042c4' ? 'BINARY_ZIP_CONTAINER' : 'APPLEDOUBLE_RESOURCE_FORK')
          : d.negative_state
      });
    }
  }

  // 3. Audit Archive.zip Central Directory
  const zipPath = path.join(EM_ROOT, '02-ORIGINALS/emstd613lineage/Archive.zip');
  const zipEntries = parseZipCentralDirectory(zipPath);
  const realZipDocs = zipEntries.filter(e => !e.is_macosx_sidecar);
  const macosxZipSidecars = zipEntries.filter(e => e.is_macosx_sidecar);

  // 4. Audit 21 Documentary Instruments
  const instrumentsDir = path.join(EM_ROOT, '06-INSTRUMENTS');
  const instrumentFiles = fs.readdirSync(instrumentsDir).filter(f => f.endsWith('.md')).sort();
  const keySynthesisProtocols = [
    'LINEAGE_ASSAY_PROTOCOL',
    'CONVERGENCE_DIVERGENCE_EMERGENCE_MATRIX',
    'MOTIF_TO_MECHANISM_TRANSLATION',
    'OBFUSCATION_DECOMPRESSION_PROTOCOL',
    'ACADEMIA_SUI_GENERIS_SIEVE_V0_1',
    'CLAIM_CEILING_PROPAGATION_V0_1',
    'DERIVATIVE_CLOCK_CUSTODY_V0_1',
    'AUTHORITY_PROVENANCE_GEOMETRY_ASSAY_V0_1',
    'EPISTEMIC_CONTROL_PLANE_HOSTILE_BATTERY_V0_1'
  ];

  const auditedInstruments = instrumentFiles.map(filename => {
    const filePath = path.join(instrumentsDir, filename);
    const content = fs.readFileSync(filePath, 'utf8');
    const hash = sha256Hex(Buffer.from(content, 'utf8'));
    const lines = content.split('\n');
    const title = (lines.find(l => l.startsWith('# ')) || filename).replace(/^#\s*/, '').trim();
    const statusLine = (lines.find(l => l.includes('Status:') || l.includes('STATUS =') || l.includes('Disciplinary classification:')) || 'DOCUMENTARY_PROTOCOL').trim();
    const baseName = filename.replace(/\.md$/, '');
    const isKeyProtocol = keySynthesisProtocols.includes(baseName);

    return {
      instrument_id: baseName,
      filename,
      relative_path: `06-INSTRUMENTS/${filename}`,
      title,
      declared_status: statusLine,
      historical_execution_classification: 'DOCUMENTARY_PROTOCOL_PRE_EXECUTION',
      standalone_executors_in_lineage: 0,
      byte_length: Buffer.byteLength(content, 'utf8'),
      sha256: hash,
      is_key_synthesis_protocol: isKeyProtocol
    };
  });

  // 5. Audit 32 Work Routes & 8 Human Gates
  const worksManifest = parseJsonl(path.join(EM_ROOT, '01-MANIFESTS/work-index.jsonl'));
  const linksManifest = parseJsonl(path.join(EM_ROOT, '01-MANIFESTS/work-manifestations.jsonl'));
  const gatedWorks = worksManifest.filter(w => w.human_gate_required);
  const minWorks = worksManifest.reduce((acc, w) => acc + (w.minimum_independent_work_contribution || 1), 0);
  const maxWorks = worksManifest.reduce((acc, w) => acc + (w.maximum_independent_work_contribution || 1), 0);
  const partitionCount = Math.pow(2, gatedWorks.length);

  // Crosswalk generation
  const sourcesById = Object.fromEntries(auditedSources.map(s => [s.source_file_id, s]));
  const derivativesBySourceId = Object.fromEntries(auditedDerivatives.map(d => [d.source_file_id, d]));

  const crosswalk = worksManifest.map(w => {
    const linkedManifestations = linksManifest.filter(l => l.work_id === w.work_id);
    const linkedSources = linkedManifestations.map(l => {
      const src = sourcesById[l.source_file_id];
      const deriv = derivativesBySourceId[l.source_file_id];
      return {
        source_file_id: l.source_file_id,
        original_filename: src ? src.original_filename : 'UNKNOWN',
        sha256: src ? src.sha256 : 'UNKNOWN',
        extraction_status: deriv ? deriv.extraction_status : 'UNKNOWN',
        is_retrievable_text: deriv ? deriv.is_retrievable_text : false
      };
    });

    return {
      work_id: w.work_id,
      declared_title: w.declared_title || w.display_title || 'UNTITLED',
      identity_status: w.identity_status,
      human_gate_required: w.human_gate_required,
      contribution_interval: [
        w.minimum_independent_work_contribution || 1,
        w.maximum_independent_work_contribution || 1
      ],
      manifestations_count: linkedManifestations.length,
      linked_sources: linkedSources
    };
  });

  // 6. Source-Coverage Ledger Answers (Section II)
  const coverageLedger = {
    denominator_total_sources: auditedSources.length, // 87
    completely_retrievable_text_sources: auditedDerivatives.filter(d => d.is_retrievable_text).length, // 53 (33 markdown + 20 PDF)
    preserved_binary_only_sources: auditedDerivatives.filter(d => !d.is_retrievable_text).length, // 34 (33 AppleDouble + 1 ZIP)
    exact_reconstructed_derivatives: auditedDerivatives.filter(d => d.is_retrievable_text).length, // 53
    ambiguous_or_human_gated_work_routes: gatedWorks.map(w => ({
      work_id: w.work_id,
      declared_title: w.declared_title || w.display_title,
      manifestation_ids: w.manifestation_source_file_ids,
      contribution_interval: [w.minimum_independent_work_contribution, w.maximum_independent_work_contribution]
    })),
    retrieved_passages_tied_to_source_bytes: true,
    historical_materials_excluded_from_query_results: [
      {
        material_class: 'APPLEDOUBLE_RESOURCE_FORK',
        count: 33,
        reason: 'Binary metadata sidecars produced by macOS zip; contains no extractable natural text'
      },
      {
        material_class: 'ZIP_ARCHIVE_CONTAINER',
        count: 1,
        source_id: 'emsrc_db43deb1f616beed44e042c4',
        filename: 'Archive.zip',
        reason: 'Binary container file; its individual member documents are preserved and extracted separately in 02-ORIGINALS'
      },
      {
        material_class: 'SEMANTIC_VECTOR_CHECKPOINT',
        count: 1,
        reason: 'Historical ONNX model checkpoint and pre-computed vector database unpreserved in a15-r0 fixture; semantic search refused to prevent false parity claims'
      }
    ]
  };

  // Compile Acquisition Manifest
  const acquisitionManifest = {
    schema: 'td613.em.corpus-acquisition-manifest/v1',
    covenant: 'Khona\u200Clit-po',
    authority: 'SAC[X6ZNK5NO51]',
    inspected_at: new Date().toISOString(),
    historical_git_revision: '30630575ade616a5a47e4066b30d2159c2bd32be',
    fixture_path: 'packages/dome_world_exact/fixtures/a15-r0/EMSTD613',
    summary_census: {
      total_source_objects: auditedSources.length,
      total_source_bytes: totalSourceBytes,
      source_format_breakdown: sourceFormatCounts,
      total_extracted_derivatives: extractedCount,
      total_unsupported_formats: unsupportedCount,
      zip_archive_central_directory_entries: zipEntries.length,
      zip_real_document_members: realZipDocs.length,
      zip_macosx_sidecars: macosxZipSidecars.length,
      total_documentary_instruments: auditedInstruments.length,
      key_synthesis_protocols_count: keySynthesisProtocols.length,
      standalone_scientific_executors_in_lineage: 0,
      total_work_routes: worksManifest.length,
      human_gated_work_routes: gatedWorks.length,
      permitted_work_count_interval: [minWorks, maxWorks],
      identity_hypotheses_partition_count: partitionCount
    },
    coverage_ledger: coverageLedger,
    sources: auditedSources,
    derivatives: auditedDerivatives,
    zip_directory: zipEntries
  };

  // Compile Identity Crosswalk
  const identityCrosswalk = {
    schema: 'td613.em.identity-crosswalk/v1',
    covenant: 'Khona\u200Clit-po',
    authority: 'SAC[X6ZNK5NO51]',
    generated_at: new Date().toISOString(),
    total_work_routes: worksManifest.length,
    human_gated_count: gatedWorks.length,
    work_count_interval: [minWorks, maxWorks],
    partitions_count: partitionCount,
    works: crosswalk
  };

  // Compile Original Methods Inventory
  const methodsInventory = {
    schema: 'td613.em.original-methods-inventory/v1',
    covenant: 'Khona\u200Clit-po',
    authority: 'SAC[X6ZNK5NO51]',
    generated_at: new Date().toISOString(),
    total_instruments: auditedInstruments.length,
    standalone_executors_count: 0,
    key_protocols_covered: keySynthesisProtocols,
    methodological_invariants: [
      'Source vs. Derivative distinction preserved',
      'Work vs. Manifestation distinction preserved',
      'Human-gated work identity (256 hypotheses) preserved without automatic gate collapse',
      'Contextual role vs. Intrinsic assertion distinction preserved',
      'Motif vs. Mechanism promotion ladder enforced',
      'Conceptual convergence vs. Genealogical descent distinguished',
      'Documentary analogy vs. Formal equivalence distinguished',
      'Observed result vs. Reconstructed history distinguished',
      'Internal integrity vs. External empirical confirmation distinguished'
    ],
    instruments: auditedInstruments
  };

  // Compile Negative Refusal Register
  const negativeRefusalRegister = {
    schema: 'td613.em.negative-refusal-register/v1',
    covenant: 'Khona\u200Clit-po',
    authority: 'SAC[X6ZNK5NO51]',
    compiled_at: new Date().toISOString(),
    registers: [
      {
        control_id: 'REFUSAL_TAMPERED_SPAN_DIGEST',
        description: 'Refuses relation admission when claimed span SHA-256 does not match source byte slice',
        disposition: 'FAIL_CLOSED',
        error_code: 'EXACT_SPAN_DIGEST_MISMATCH'
      },
      {
        control_id: 'REFUSAL_FABRICATED_WARRANT',
        description: 'Refuses relation admission when warrant lacks non-null cryptographic source_capture_span_proof',
        disposition: 'FAIL_CLOSED',
        error_code: 'MISSING_SPAN_PROOF'
      },
      {
        control_id: 'REFUSAL_UNGATED_IDENTITY_UNIFICATION',
        description: 'Refuses automatic collapsing of human-gated Work routes into a single identity',
        disposition: 'FAIL_CLOSED',
        error_code: 'HUMAN_GATE_REQUIRED'
      },
      {
        control_id: 'REFUSAL_INTRINSIC_ROLE_PROMOTION',
        description: 'Refuses promotion of compiler-pass contextual roles into intrinsic entity assertions',
        disposition: 'FAIL_CLOSED',
        error_code: 'INTRINSIC_ROLE_PROMOTION_FORBIDDEN'
      },
      {
        control_id: 'REFUSAL_ZIP_PATH_TRAVERSAL_AND_SLIP',
        description: 'Refuses ZIP extraction of archive members containing path escapes (..), absolute paths, or symlinks',
        disposition: 'FAIL_CLOSED',
        error_code: 'ZIP_PATH_TRAVERSAL_REFUSED'
      },
      {
        control_id: 'REFUSAL_ZIP_RESOURCE_EXHAUSTION',
        description: 'Refuses ZIP extraction exceeding size ratio limits, file count limits, or cumulative byte bounds',
        disposition: 'FAIL_CLOSED',
        error_code: 'ZIP_RESOURCE_LIMIT_EXCEEDED'
      },
      {
        control_id: 'REFUSAL_UNSUPPORTED_FORMAT_TEXT_EXTRACTION',
        description: 'Refuses text queries against AppleDouble metadata sidecars and raw ZIP containers',
        disposition: 'FAIL_CLOSED',
        error_code: 'UNSUPPORTED_FORMAT'
      },
      {
        control_id: 'REFUSAL_UNSUPPORTED_SEMANTIC_MODEL_CLAIMS',
        description: 'Refuses asserting semantic retrieval parity when ONNX model checkpoint is unavailable in historical fixture',
        disposition: 'FAIL_CLOSED',
        error_code: 'SEMANTIC_MODEL_UNAVAILABLE'
      },
      {
        control_id: 'REFUSAL_NO_UNIFICATION_WARRANTED',
        description: 'Returns NO_UNIFICATION_WARRANTED when cross-domain theories fail composability, boundary compatibility, or empirical distinction',
        disposition: 'FAIL_CLOSED',
        verdict: 'NO_UNIFICATION_WARRANTED'
      }
    ]
  };

  // Write Out Deliverable JSON Files
  const manifestPath = path.join(__dirname, 'corpus_acquisition_manifest.json');
  const crosswalkPath = path.join(__dirname, 'identity_metadata_crosswalk.json');
  const methodsPath = path.join(__dirname, 'original_methods_inventory.json');
  const refusalPath = path.join(__dirname, 'negative_refusal_register.json');

  fs.writeFileSync(manifestPath, JSON.stringify(acquisitionManifest, null, 2), 'utf8');
  fs.writeFileSync(crosswalkPath, JSON.stringify(identityCrosswalk, null, 2), 'utf8');
  fs.writeFileSync(methodsPath, JSON.stringify(methodsInventory, null, 2), 'utf8');
  fs.writeFileSync(refusalPath, JSON.stringify(negativeRefusalRegister, null, 2), 'utf8');

  console.log(`✓ Generated ${manifestPath}`);
  console.log(`✓ Generated ${crosswalkPath}`);
  console.log(`✓ Generated ${methodsPath}`);
  console.log(`✓ Generated ${refusalPath}`);

  return {
    acquisitionManifest,
    identityCrosswalk,
    methodsInventory,
    negativeRefusalRegister
  };
}

if (process.argv[1] && process.argv[1].endsWith('corpus-inspector.mjs')) {
  inspectCorpus();
}
