(function () {
  window.TCP_RETRIEVAL_FIXTURES = {
  "generatedAt": "2026-04-10T06:07:05.481Z",
  "cases": {
    "package-handoff-formal-record-under-rushed-mobile": {
      "id": "package-handoff-formal-record-under-rushed-mobile",
      "category": "retrieval-same-fact",
      "strength": 0.88,
      "sourceText": "On Tuesday, March 18, the rush parcel addressed to Unit 2B was not presented for signature at the apartment door. The carrier scan marked \"attempted / no answer\" at 6:41 PM, but building footage and resident testimony indicate no buzzer call was placed to Unit 2B during that minute. The package was instead left on the second-floor landing near the stair rail. Ms. Chen located it at approximately 7:06 PM after noticing the door tag and asking maintenance whether a delivery had come through. I moved the parcel from the landing to the hallway table outside 2B only after Ms. Chen confirmed it was hers and requested help because she was already carrying groceries. The outer carton remained sealed. The red rush label remained attached. No third party handled the parcel after pickup from the landing. The corrective issue is not merely where the box rested, but that the signature record implies a contact attempt that the building log does not support.",
      "donorText": "2b pkg wasnt brought down. tag says attempted 6:41 but no one buzzed her. it was just sitting on 2nd fl landing by rail. red rush sticker still on it. i moved it to hall table after she said yes its hers / she had bags already. if mgmt asks: box stayed sealed.",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.88,
        "profile": {
          "avgSentenceLength": 8.83,
          "sentenceCount": 6,
          "contractionDensity": 0,
          "punctuationDensity": 0.151,
          "contentWordComplexity": 0.173,
          "modifierDensity": 0.026,
          "directness": 0,
          "abstractionPosture": 0.5
        }
      },
      "retrievalTrace": {
        "sourceText": "On Tuesday, March 18, the rush parcel addressed to Unit 2B was not presented for signature at the apartment door. The carrier scan marked \"attempted / no answer\" at 6:41 PM, but building footage and resident testimony indicate no buzzer call was placed to Unit 2B during that minute. The package was instead left on the second-floor landing near the stair rail. Ms. Chen located it at approximately 7:06 PM after noticing the door tag and asking maintenance whether a delivery had come through. I moved the parcel from the landing to the hallway table outside 2B only after Ms. Chen confirmed it was hers and requested help because she was already carrying groceries. The outer carton remained sealed. The red rush label remained attached. No third party handled the parcel after pickup from the landing. The corrective issue is not merely where the box rested, but that the signature record implies a contact attempt that the building log does not support.",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.8,
          "profile": {
            "avgSentenceLength": 8.31,
            "sentenceCount": 11,
            "contractionDensity": 0.008,
            "punctuationDensity": 0.155,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.221,
            "modifierDensity": 0.028,
            "hedgeDensity": 0.014,
            "directness": 0.063,
            "abstractionPosture": 0.5,
            "latinatePreference": 0.009,
            "recurrencePressure": 0.148
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 11,
            "clauseCount": 13,
            "literalSpans": [
              {
                "value": "6:41 PM",
                "placeholder": "__PROTLIT_A__"
              },
              {
                "value": "7:06 PM",
                "placeholder": "__PROTLIT_B__"
              },
              {
                "value": "\"attempted / no answer\"",
                "placeholder": "__PROTLIT_C__"
              },
              {
                "value": "18",
                "placeholder": "__PROTLIT_D__"
              },
              {
                "value": "2B",
                "placeholder": "__PROTLIT_E__"
              },
              {
                "value": "2B",
                "placeholder": "__PROTLIT_F__"
              },
              {
                "value": "2B",
                "placeholder": "__PROTLIT_G__"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "On Tuesday, March __PROTLIT_D__, the rush parcel addressed to Unit __PROTLIT_E__ was not presented for signature at the apartment door",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "On Tuesday, March __PROTLIT_D__, the rush parcel addressed to Unit __PROTLIT_E__ was not presented for signature at the apartment door",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "was",
                  "actor": "the rush",
                  "action": "was",
                  "object": "presented signature at apartment door",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "The carrier scan marked __PROTLIT_C__ at __PROTLIT_A__, but building footage and resident testimony indicate no buzzer call was placed to Unit __PROTLIT_F__ during that minute",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "The carrier scan marked __PROTLIT_C__ at __PROTLIT_A__, but building footage and resident testimony indicate no buzzer call was placed to Unit __PROTLIT_F__ during that minute",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "call",
                  "actor": "The carrier",
                  "action": "call",
                  "object": "placed unit protlit f during",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "The package was instead left on the second-floor landing near the stair rail",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "The package was instead left on the second-floor landing near the stair rail",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "left",
                  "actor": "The package",
                  "action": "left",
                  "object": "second floor landing near stair",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "Ms",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "Ms",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "ms",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "Chen located it at approximately __PROTLIT_B__ after noticing the door tag and asking maintenance whether a delivery had come through",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "Chen located it at approximately __PROTLIT_B__ after noticing the door tag and asking maintenance whether a delivery had come through",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "located",
                  "actor": "it",
                  "action": "located",
                  "object": "at approximately protlit b after",
                  "modifiers": [
                    "approximately"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "I moved the parcel from the landing to the hallway table outside __PROTLIT_G__ only after Ms",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "I moved the parcel from the landing to the hallway table outside __PROTLIT_G__ only after Ms",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "moved",
                  "actor": "I",
                  "action": "moved",
                  "object": "parcel from landing hallway table",
                  "modifiers": [
                    "table",
                    "only"
                  ],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                }
              ]
            },
            {
              "id": "s6",
              "raw": "Chen confirmed it was hers and requested help because she was already carrying groceries",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s6c0",
                  "text": "Chen confirmed it was hers and requested help",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "confirmed",
                  "actor": "it",
                  "action": "confirmed",
                  "object": "hers requested help",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s6c1",
                  "text": "she was already carrying groceries",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "was",
                  "actor": "she",
                  "action": "was",
                  "object": "already carrying groceries",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s7",
              "raw": "The outer carton remained sealed",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s7c0",
                  "text": "The outer carton remained sealed",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "outer",
                  "actor": "The outer",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s8",
              "raw": "The red rush label remained attached",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s8c0",
                  "text": "The red rush label remained attached",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "red",
                  "actor": "The red",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s9",
              "raw": "No third party handled the parcel after pickup from the landing",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s9c0",
                  "text": "No third party handled the parcel after pickup from the landing",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "no",
                  "actor": "the parcel",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s10",
              "raw": "The corrective issue is not merely where the box rested, but that the signature record implies a contact attempt that the building log does not support.",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s10c0",
                  "text": "The corrective issue is not merely where the box rested",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "issue",
                  "actor": "The corrective",
                  "action": "issue",
                  "object": "merely where box rested",
                  "modifiers": [
                    "corrective",
                    "merely"
                  ],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                },
                {
                  "id": "s10c1",
                  "text": "that the signature record implies a contact attempt that the building log does not support",
                  "relationToPrev": "additive",
                  "clauseType": "relative",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "contact",
                  "actor": "that",
                  "action": "contact",
                  "object": "attempt building log support",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "opportunityProfile": {
          "sentenceSplit": 0,
          "sentenceMerge": 10,
          "contraction": 2,
          "connector": 6,
          "lineBreak": 10,
          "abbreviation": 0,
          "orthography": 0,
          "fragment": 1,
          "conversational": 0,
          "additive": 3,
          "contrastive": 3,
          "causal": 1,
          "temporal": 3,
          "clarifying": 0,
          "resumptive": 0
        },
        "planSummary": {
          "transferMode": "compress",
          "structuralOperationsSelected": [
            "clause-texture"
          ],
          "lexicalRegisterOperationsSelected": [
            "contraction"
          ],
          "connectorStrategy": "additive",
          "contractionStrategy": "increase",
          "relationInventory": {
            "additive": 3,
            "contrastive": 3,
            "causal": 1,
            "temporal": 3,
            "clarifying": 0,
            "resumptive": 0
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": -6.6
          },
          "discourseGoals": {
            "contractionDelta": 0.008,
            "hedgeDelta": 0.014
          },
          "registerGoals": {
            "contentWordComplexityDelta": -0.143,
            "modifierDensityDelta": -0.007000000000000003,
            "directnessDelta": -0.11699999999999999,
            "abstractionDelta": 0,
            "latinateDelta": -0.026000000000000002,
            "registerMode": "compressed"
          },
          "operationBudget": {
            "splitSentence": 16,
            "mergeSentence": 0,
            "swapConnector": 2,
            "applyHedge": 0,
            "realizeLexicon": 4
          }
        },
        "candidateSummary": {
          "selected": {
            "spec": "ir-beam-search",
            "score": 398.62,
            "passesApplied": [
              "baseline-floor",
              "clause-texture",
              "contraction"
            ],
            "rescuePasses": [],
            "changedDimensions": [
              "sentence-mean",
              "sentence-count",
              "contraction-posture",
              "connector-stance",
              "lexical-register",
              "directness",
              "abbreviation-posture",
              "orthography-posture",
              "fragment-posture",
              "punctuation-shape"
            ],
            "qualityGatePassed": true,
            "notes": []
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 398.62,
              "passesApplied": [
                "baseline-floor",
                "clause-texture",
                "contraction"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "contraction-posture",
                "connector-stance",
                "lexical-register",
                "directness",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "mixed-structural",
              "score": 402.082,
              "passesApplied": [
                "baseline-split",
                "baseline-contraction",
                "baseline-voice-realization",
                "connector-stance-lexicon",
                "punctuation-finish"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "contraction-posture",
                "connector-stance",
                "lexical-register",
                "directness",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "split-heavy",
              "score": 402.082,
              "passesApplied": [
                "baseline-split",
                "baseline-contraction",
                "baseline-voice-realization",
                "connector-stance-lexicon",
                "punctuation-finish"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "contraction-posture",
                "connector-stance",
                "lexical-register",
                "directness",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "connector-stance-heavy",
              "score": 402.082,
              "passesApplied": [
                "baseline-split",
                "baseline-contraction",
                "baseline-voice-realization",
                "connector-stance-lexicon",
                "punctuation-finish"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "contraction-posture",
                "connector-stance",
                "lexical-register",
                "directness",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "lexical-register-heavy",
              "score": 400.12,
              "passesApplied": [
                "baseline-split",
                "baseline-contraction",
                "baseline-voice-realization",
                "connector-stance-lexicon"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "contraction-posture",
                "connector-stance",
                "lexical-register",
                "directness",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            }
          ]
        },
        "finalRealization": {
          "text": "On Tuesday, March 18. The rush parcel addressed to Unit 2B wasnt presented for signature at the apartment door. The carrier scan marked \"attempted / no answer\" at 6:41 PM, but building footage and resident testimony indicate no buzzer call was placed to Unit 2B during that min. The pkg was instead left on the second-floor landing near the stair rail. Ms. Chen found it at approximately 7:06 PM after noticing the door tag and asking maintenance whether a delivery had come thru. I moved the parcel from the landing to the hallway table outside 2B only after Ms. Chen confirmed it was hers and asked help bc she was already carrying groceries. The outer carton remained sealed. The red rush label remained attached. No third party handled the parcel after pickup from the landing. The corrective issue is not merely where the box rested, but that the signature record implies a call attempt that the building log doesn't help.",
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "contraction-posture",
            "connector-stance",
            "lexical-register",
            "directness",
            "abbreviation-posture",
            "fragment-posture",
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "help",
              "from": "support",
              "to": "help",
              "kind": "lexeme"
            },
            {
              "family": "ask",
              "from": "requested",
              "to": "asking",
              "kind": "lexeme"
            },
            {
              "family": "find",
              "from": "located",
              "to": "found",
              "kind": "lexeme"
            },
            {
              "family": "call",
              "from": "contact",
              "to": "call",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "donorProgress": {
            "eligible": true,
            "sourceDonorDistance": 4.429,
            "outputDonorDistance": 3.523,
            "donorImprovement": 0.906,
            "donorImprovementRatio": 0.205,
            "sourceOutputLexicalOverlap": 0.855
          },
          "rescuePasses": [
            "partial-rescue",
            "semantic-final-warning",
            "td613-aperture-warning"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "semanticAudit": {
          "propositionCoverage": 1,
          "actorCoverage": 0.975,
          "actionCoverage": 1,
          "objectCoverage": 0.923,
          "polarityMismatches": 0,
          "tenseMismatches": 1,
          "protectedAnchorIntegrity": 1,
          "clauseAudits": [
            {
              "sourceClauseId": "s0c0",
              "matchedClauseId": "s1c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.167,
              "globalBagScore": 0.039
            },
            {
              "sourceClauseId": "s1c0",
              "matchedClauseId": "s2c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.556,
              "globalBagScore": 0.102
            },
            {
              "sourceClauseId": "s2c0",
              "matchedClauseId": "s3c0",
              "propositionCoverage": 1,
              "actorCoverage": 0.675,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.75,
              "globalBagScore": 0.125
            },
            {
              "sourceClauseId": "s3c0",
              "matchedClauseId": "s4c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.021
            },
            {
              "sourceClauseId": "s4c0",
              "matchedClauseId": "s5c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 1,
              "bagScore": 0.333,
              "globalBagScore": 0.06
            },
            {
              "sourceClauseId": "s5c0",
              "matchedClauseId": "s6c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.128
            },
            {
              "sourceClauseId": "s6c0",
              "matchedClauseId": "s7c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.667,
              "globalBagScore": 0.085
            },
            {
              "sourceClauseId": "s6c1",
              "matchedClauseId": "s0c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0,
              "globalBagScore": 0.02
            },
            {
              "sourceClauseId": "s7c0",
              "matchedClauseId": "s8c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.021
            },
            {
              "sourceClauseId": "s8c0",
              "matchedClauseId": "s9c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.021
            },
            {
              "sourceClauseId": "s9c0",
              "matchedClauseId": "s10c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.043
            },
            {
              "sourceClauseId": "s10c0",
              "matchedClauseId": "s11c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.128
            },
            {
              "sourceClauseId": "s10c1",
              "matchedClauseId": "s11c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.833,
              "globalBagScore": 0.106
            }
          ],
          "sourceClauseCount": 13,
          "outputClauseCount": 13
        },
        "protectedAnchorAudit": {
          "totalAnchors": 7,
          "resolvedAnchors": 7,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 12,
            "clauseCount": 13,
            "literalSpans": [
              {
                "value": "6:41 PM",
                "placeholder": "__PROTLIT_A__"
              },
              {
                "value": "7:06 PM",
                "placeholder": "__PROTLIT_B__"
              },
              {
                "value": "\"attempted / no answer\"",
                "placeholder": "__PROTLIT_C__"
              },
              {
                "value": "18",
                "placeholder": "__PROTLIT_D__"
              },
              {
                "value": "2B",
                "placeholder": "__PROTLIT_E__"
              },
              {
                "value": "2B",
                "placeholder": "__PROTLIT_F__"
              },
              {
                "value": "2B",
                "placeholder": "__PROTLIT_G__"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "On Tuesday, March 18",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "On Tuesday, March 18",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "tuesday",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "The rush parcel addressed to Unit 2B wasnt presented for signature at the apartment door",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "The rush parcel addressed to Unit 2B wasnt presented for signature at the apartment door",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "rush",
                  "actor": "The rush",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "The carrier scan marked \"attempted / no answer\" at 6:41 PM, but building footage and resident testimony indicate no buzzer call was placed to Unit 2B during that min",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "The carrier scan marked \"attempted / no answer\" at 6:41 PM, but building footage and resident testimony indicate no buzzer call was placed to Unit 2B during that min",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "call",
                  "actor": "The carrier",
                  "action": "call",
                  "object": "placed unit 2b during min",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "The pkg was instead left on the second-floor landing near the stair rail",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "The pkg was instead left on the second-floor landing near the stair rail",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "left",
                  "actor": "The pkg",
                  "action": "left",
                  "object": "second floor landing near stair",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "Ms",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "Ms",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "ms",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "Chen found it at approximately 7:06 PM after noticing the door tag and asking maintenance whether a delivery had come thru",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "Chen found it at approximately 7:06 PM after noticing the door tag and asking maintenance whether a delivery had come thru",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "found",
                  "actor": "it",
                  "action": "found",
                  "object": "at approximately 7 06 pm",
                  "modifiers": [
                    "approximately"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s6",
              "raw": "I moved the parcel from the landing to the hallway table outside 2B only after Ms",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s6c0",
                  "text": "I moved the parcel from the landing to the hallway table outside 2B only after Ms",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "moved",
                  "actor": "I",
                  "action": "moved",
                  "object": "parcel from landing hallway table",
                  "modifiers": [
                    "table",
                    "only"
                  ],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                }
              ]
            },
            {
              "id": "s7",
              "raw": "Chen confirmed it was hers and asked help bc she was already carrying groceries",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s7c0",
                  "text": "Chen confirmed it was hers and asked help bc she was already carrying groceries",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "confirmed",
                  "actor": "it",
                  "action": "confirmed",
                  "object": "hers asked help bc already",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s8",
              "raw": "The outer carton remained sealed",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s8c0",
                  "text": "The outer carton remained sealed",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "outer",
                  "actor": "The outer",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s9",
              "raw": "The red rush label remained attached",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s9c0",
                  "text": "The red rush label remained attached",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "red",
                  "actor": "The red",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s10",
              "raw": "No third party handled the parcel after pickup from the landing",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s10c0",
                  "text": "No third party handled the parcel after pickup from the landing",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "no",
                  "actor": "the parcel",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s11",
              "raw": "The corrective issue is not merely where the box rested, but that the signature record implies a call attempt that the building log doesn't help.",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s11c0",
                  "text": "The corrective issue is not merely where the box rested",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "issue",
                  "actor": "The corrective",
                  "action": "issue",
                  "object": "merely where box rested",
                  "modifiers": [
                    "corrective",
                    "merely"
                  ],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                },
                {
                  "id": "s11c1",
                  "text": "that the signature record implies a call attempt that the building log doesn't help",
                  "relationToPrev": "additive",
                  "clauseType": "relative",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "call",
                  "actor": "that",
                  "action": "call",
                  "object": "attempt building log doesn't help",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "realizationSummary": {
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "contraction-posture",
            "connector-stance",
            "lexical-register",
            "directness",
            "abbreviation-posture",
            "fragment-posture",
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "help",
              "from": "support",
              "to": "help",
              "kind": "lexeme"
            },
            {
              "family": "ask",
              "from": "requested",
              "to": "asking",
              "kind": "lexeme"
            },
            {
              "family": "find",
              "from": "located",
              "to": "found",
              "kind": "lexeme"
            },
            {
              "family": "call",
              "from": "contact",
              "to": "call",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "donorProgress": {
            "eligible": true,
            "sourceDonorDistance": 4.429,
            "outputDonorDistance": 3.523,
            "donorImprovement": 0.906,
            "donorImprovementRatio": 0.205,
            "sourceOutputLexicalOverlap": 0.855
          },
          "realizationNotes": [
            "4 lexical family swaps landed.",
            "Register shift surfaced through lexical-register, directness, abbreviation-posture, orthography-posture, fragment-posture.",
            "Semantic risk is elevated; review the realized output before relying on it."
          ],
          "rescuePasses": [
            "partial-rescue",
            "semantic-final-warning",
            "td613-aperture-warning"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "generatorVersion": "v2",
        "sourceClass": "procedural-record",
        "candidateLedger": [
          {
            "id": "base",
            "envelopeId": "spark",
            "status": "eligible",
            "score": 0.768,
            "rewriteStrength": 1,
            "targetFit": 0.275,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "On Tuesday, March 18. The rush parcel addressed to Unit 2B wasnt presented for signature at the apartment door. The carrier scan marked \"attempted / no answer\" "
          },
          {
            "id": "amplified",
            "envelopeId": "spark",
            "status": "eligible",
            "score": 0.7677,
            "rewriteStrength": 1,
            "targetFit": 0.2741,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "On Tuesday, March 18. The rush parcel addressed to Unit 2B wasnt presented for signature at the apartment door. The carrier scan marked \"attempted / no answer\" "
          },
          {
            "id": "contrast",
            "envelopeId": "spark",
            "status": "eligible",
            "score": 0.7668,
            "rewriteStrength": 1,
            "targetFit": 0.2712,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "On Tuesday, March 18. The rush parcel addressed to Unit 2B wasnt presented for signature at the apartment door. The carrier scan marked \"attempted / no answer\" "
          },
          {
            "id": "conservative",
            "envelopeId": "spark",
            "status": "selected",
            "score": 0.7688,
            "rewriteStrength": 1,
            "targetFit": 0.2776,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "On Tuesday, March 18. The rush parcel addressed to Unit 2B wasnt presented for signature at the apartment door. The carrier scan marked \"attempted / no answer\" "
          }
        ],
        "generationDocket": {
          "status": "landed",
          "holdClass": null,
          "headline": "Generator V2 landed a registered rewrite.",
          "reasons": [],
          "candidateCount": 4,
          "winningCandidateId": "conservative"
        },
        "winningCandidateId": "conservative"
      },
      "semanticContract": {
        "transferClass": "structural",
        "realizationTier": "lexical-structural",
        "changedDimensions": [
          "abbreviation-posture",
          "connector-stance",
          "contraction-posture",
          "directness",
          "fragment-posture",
          "lexical-register",
          "punctuation-shape",
          "sentence-count",
          "sentence-mean"
        ],
        "lexemeSwapFamilies": [
          "ask",
          "call",
          "find",
          "help"
        ],
        "relationInventory": [
          "additive:3",
          "causal:1",
          "clarifying:0",
          "contrastive:3",
          "resumptive:0",
          "temporal:3"
        ],
        "structuralOperations": [
          "clause-texture"
        ],
        "lexicalOperations": [
          "contraction"
        ],
        "connectorStrategy": "additive",
        "contractionStrategy": "increase",
        "propositionCoverage": 1,
        "actorCoverage": 0.975,
        "actionCoverage": 1,
        "objectCoverage": 0.923,
        "polarityMismatches": 0,
        "tenseMismatches": 1,
        "protectedAnchorIntegrity": 1
      }
    },
    "package-handoff-rushed-mobile-under-formal-record": {
      "id": "package-handoff-rushed-mobile-under-formal-record",
      "category": "retrieval-same-fact",
      "strength": 0.88,
      "sourceText": "2b pkg wasnt brought down. tag says attempted 6:41 but no one buzzed her. it was just sitting on 2nd fl landing by rail. red rush sticker still on it. i moved it to hall table after she said yes its hers / she had bags already. if mgmt asks: box stayed sealed.",
      "donorText": "On Tuesday, March 18, the rush parcel addressed to Unit 2B was not presented for signature at the apartment door. The carrier scan marked \"attempted / no answer\" at 6:41 PM, but building footage and resident testimony indicate no buzzer call was placed to Unit 2B during that minute. The package was instead left on the second-floor landing near the stair rail. Ms. Chen located it at approximately 7:06 PM after noticing the door tag and asking maintenance whether a delivery had come through. I moved the parcel from the landing to the hallway table outside 2B only after Ms. Chen confirmed it was hers and requested help because she was already carrying groceries. The outer carton remained sealed. The red rush label remained attached. No third party handled the parcel after pickup from the landing. The corrective issue is not merely where the box rested, but that the signature record implies a contact attempt that the building log does not support.",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.88,
        "profile": {
          "avgSentenceLength": 14.91,
          "sentenceCount": 11,
          "contractionDensity": 0,
          "punctuationDensity": 0.11,
          "contentWordComplexity": 0.364,
          "modifierDensity": 0.035,
          "directness": 0.18,
          "abstractionPosture": 0
        }
      },
      "retrievalTrace": {
        "sourceText": "2b pkg wasnt brought down. tag says attempted 6:41 but no one buzzed her. it was just sitting on 2nd fl landing by rail. red rush sticker still on it. i moved it to hall table after she said yes its hers / she had bags already. if mgmt asks: box stayed sealed.",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.88,
          "profile": {
            "avgSentenceLength": 14.78,
            "sentenceCount": 6,
            "contractionDensity": 0,
            "punctuationDensity": 0.111,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.318,
            "modifierDensity": 0.033,
            "hedgeDensity": 0.019,
            "directness": 0.137,
            "abstractionPosture": 0.5,
            "latinatePreference": 0.027,
            "recurrencePressure": 0.181
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 6,
            "clauseCount": 6,
            "literalSpans": [
              {
                "value": "6:41",
                "placeholder": "__PROTLIT_A__"
              },
              {
                "value": "2b",
                "placeholder": "__PROTLIT_B__"
              },
              {
                "value": "2nd",
                "placeholder": "__PROTLIT_C__"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "__PROTLIT_B__ pkg wasnt brought down",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "__PROTLIT_B__ pkg wasnt brought down",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "brought",
                  "actor": "",
                  "action": "brought",
                  "object": "down",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "tag says attempted __PROTLIT_A__ but no one buzzed her",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "tag says attempted __PROTLIT_A__ but no one buzzed her",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "says",
                  "actor": "",
                  "action": "says",
                  "object": "attempted protlit no one buzzed",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "it was just sitting on __PROTLIT_C__ fl landing by rail",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "it was just sitting on __PROTLIT_C__ fl landing by rail",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "was",
                  "actor": "it",
                  "action": "was",
                  "object": "sitting protlit c fl landing",
                  "modifiers": [],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                }
              ]
            },
            {
              "id": "s3",
              "raw": "red rush sticker still on it",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "red rush sticker still on it",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "red",
                  "actor": "it",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "i moved it to hall table after she said yes its hers / she had bags already",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "i moved it to hall table after she said yes its hers / she had bags already",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "moved",
                  "actor": "i",
                  "action": "moved",
                  "object": "hall table after said yes",
                  "modifiers": [
                    "table"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "if mgmt asks: box stayed sealed.",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "if mgmt asks: box stayed sealed",
                  "relationToPrev": "start",
                  "clauseType": "subordinate",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "asks",
                  "actor": "",
                  "action": "asks",
                  "object": "box stayed sealed",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "opportunityProfile": {
          "sentenceSplit": 1,
          "sentenceMerge": 5,
          "contraction": 0,
          "connector": 3,
          "lineBreak": 5,
          "abbreviation": 2,
          "orthography": 6,
          "fragment": 0,
          "conversational": 0,
          "additive": 0,
          "contrastive": 2,
          "causal": 0,
          "temporal": 1,
          "clarifying": 0,
          "resumptive": 1
        },
        "planSummary": {
          "transferMode": "expand",
          "structuralOperationsSelected": [
            "merge-pairs",
            "clause-texture"
          ],
          "lexicalRegisterOperationsSelected": [],
          "connectorStrategy": "contrastive",
          "contractionStrategy": "hold",
          "relationInventory": {
            "additive": 0,
            "contrastive": 2,
            "causal": 0,
            "temporal": 1,
            "clarifying": 0,
            "resumptive": 1
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": 5.949999999999999
          },
          "discourseGoals": {
            "contractionDelta": 0,
            "hedgeDelta": 0
          },
          "registerGoals": {
            "contentWordComplexityDelta": 0.14500000000000002,
            "modifierDensityDelta": 0.007000000000000003,
            "directnessDelta": 0.137,
            "abstractionDelta": 0,
            "latinateDelta": 0.027,
            "registerMode": "plain"
          },
          "operationBudget": {
            "splitSentence": 0,
            "mergeSentence": 6,
            "swapConnector": 2,
            "applyHedge": 2,
            "realizeLexicon": 5
          }
        },
        "candidateSummary": {
          "selected": {
            "spec": "ir-beam-search",
            "score": 359.672,
            "passesApplied": [
              "merge-pairs",
              "clause-texture"
            ],
            "rescuePasses": [],
            "changedDimensions": [
              "sentence-mean",
              "sentence-count",
              "sentence-spread",
              "contraction-posture",
              "connector-stance",
              "lexical-register",
              "abbreviation-posture",
              "orthography-posture",
              "punctuation-shape"
            ],
            "qualityGatePassed": true,
            "notes": []
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 359.672,
              "passesApplied": [
                "merge-pairs",
                "clause-texture"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "contraction-posture",
                "connector-stance",
                "lexical-register",
                "abbreviation-posture",
                "orthography-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "mixed-structural",
              "score": 284.728,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "connector-stance-lexicon",
                "contraction-auxiliary"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "orthography-posture",
                "fragment-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "merge-heavy",
              "score": 284.728,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "connector-stance-lexicon",
                "contraction-auxiliary"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "orthography-posture",
                "fragment-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "connector-stance-heavy",
              "score": 284.728,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "connector-stance-lexicon",
                "contraction-auxiliary"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "orthography-posture",
                "fragment-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "lexical-register-heavy",
              "score": 284.728,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "connector-stance-lexicon",
                "contraction-auxiliary"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "orthography-posture",
                "fragment-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            }
          ]
        },
        "finalRealization": {
          "text": "2b package wasn't brought down, but tag says attempted 6:41 but no one buzzed her. It was just sitting on 2nd fl landing by rail, but red rush sticker still on it. I moved it to hall table after she said yes its hers; she had bags already. If management asks: box stayed sealed.",
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "sentence-spread",
            "contraction-posture",
            "connector-stance",
            "lexical-register",
            "abbreviation-posture",
            "orthography-posture",
            "surface-marker-posture",
            "punctuation-shape"
          ],
          "lexemeSwaps": [],
          "semanticRisk": 0.3,
          "donorProgress": {
            "eligible": true,
            "sourceDonorDistance": 4.293,
            "outputDonorDistance": 3.084,
            "donorImprovement": 1.209,
            "donorImprovementRatio": 0.282,
            "sourceOutputLexicalOverlap": 0.885
          },
          "rescuePasses": [
            "partial-rescue",
            "semantic-final-warning",
            "td613-aperture-warning"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "semanticAudit": {
          "propositionCoverage": 1,
          "actorCoverage": 1,
          "actionCoverage": 1,
          "objectCoverage": 0.917,
          "polarityMismatches": 0,
          "tenseMismatches": 1,
          "protectedAnchorIntegrity": 1,
          "clauseAudits": [
            {
              "sourceClauseId": "s0c0",
              "matchedClauseId": "s0c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 1,
              "bagScore": 0.333,
              "globalBagScore": 0.091
            },
            {
              "sourceClauseId": "s1c0",
              "matchedClauseId": "s0c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.2,
              "globalBagScore": 0.077
            },
            {
              "sourceClauseId": "s2c0",
              "matchedClauseId": "s1c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.429,
              "globalBagScore": 0.125
            },
            {
              "sourceClauseId": "s3c0",
              "matchedClauseId": "s1c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0,
              "globalBagScore": 0
            },
            {
              "sourceClauseId": "s4c0",
              "matchedClauseId": "s2c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.273
            },
            {
              "sourceClauseId": "s5c0",
              "matchedClauseId": "s3c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.182
            }
          ],
          "sourceClauseCount": 6,
          "outputClauseCount": 5
        },
        "protectedAnchorAudit": {
          "totalAnchors": 3,
          "resolvedAnchors": 3,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 4,
            "clauseCount": 5,
            "literalSpans": [
              {
                "value": "6:41",
                "placeholder": "__PROTLIT_A__"
              },
              {
                "value": "2b",
                "placeholder": "__PROTLIT_B__"
              },
              {
                "value": "2nd",
                "placeholder": "__PROTLIT_C__"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "2b package wasn't brought down, but tag says attempted 6:41 but no one buzzed her",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "2b package wasn't brought down, but tag says attempted 6:41 but no one buzzed her",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "brought",
                  "actor": "",
                  "action": "brought",
                  "object": "down tag says attempted 6",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "It was just sitting on 2nd fl landing by rail, but red rush sticker still on it",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "It was just sitting on 2nd fl landing by rail, but red rush sticker still on it",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "was",
                  "actor": "It",
                  "action": "was",
                  "object": "sitting 2nd fl landing by",
                  "modifiers": [],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                }
              ]
            },
            {
              "id": "s2",
              "raw": "I moved it to hall table after she said yes its hers; she had bags already",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "I moved it to hall table after she said yes its hers",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "moved",
                  "actor": "I",
                  "action": "moved",
                  "object": "hall table after said yes",
                  "modifiers": [
                    "table"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s2c1",
                  "text": "she had bags already",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "had",
                  "actor": "she",
                  "action": "had",
                  "object": "bags already",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "If management asks: box stayed sealed.",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "If management asks: box stayed sealed",
                  "relationToPrev": "start",
                  "clauseType": "subordinate",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "asks",
                  "actor": "",
                  "action": "asks",
                  "object": "box stayed sealed",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "realizationSummary": {
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "sentence-spread",
            "contraction-posture",
            "connector-stance",
            "lexical-register",
            "abbreviation-posture",
            "orthography-posture",
            "surface-marker-posture",
            "punctuation-shape"
          ],
          "lexemeSwaps": [],
          "semanticRisk": 0.3,
          "donorProgress": {
            "eligible": true,
            "sourceDonorDistance": 4.293,
            "outputDonorDistance": 3.084,
            "donorImprovement": 1.209,
            "donorImprovementRatio": 0.282,
            "sourceOutputLexicalOverlap": 0.885
          },
          "realizationNotes": [
            "Register shift surfaced through lexical-register, abbreviation-posture, orthography-posture.",
            "Semantic risk is elevated; review the realized output before relying on it."
          ],
          "rescuePasses": [
            "partial-rescue",
            "semantic-final-warning",
            "td613-aperture-warning"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "generatorVersion": "v2",
        "sourceClass": "formal-correspondence",
        "candidateLedger": [
          {
            "id": "base",
            "envelopeId": "archivist",
            "status": "selected",
            "score": 0.8077,
            "rewriteStrength": 1,
            "targetFit": 0.3991,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "2b package wasn't brought down, but tag says attempted 6:41 but no one buzzed her. It was just sitting on 2nd fl landing by rail, but red rush sticker still on "
          },
          {
            "id": "amplified",
            "envelopeId": "archivist",
            "status": "eligible",
            "score": 0.7496,
            "rewriteStrength": 1,
            "targetFit": 0.2174,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "2b package wasn't brought down, but tag says attempted 6:41 but no one buzzed her. It was just sitting on 2nd fl landing by rail, but red rush sticker still on "
          },
          {
            "id": "contrast",
            "envelopeId": "archivist",
            "status": "eligible",
            "score": 0.7523,
            "rewriteStrength": 1,
            "targetFit": 0.2259,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "2b package wasn't brought down, but tag says attempted 6:41 but no one buzzed her. It was just sitting on 2nd fl landing by rail, but red rush sticker still on "
          },
          {
            "id": "conservative",
            "envelopeId": "archivist",
            "status": "eligible",
            "score": 0.7461,
            "rewriteStrength": 1,
            "targetFit": 0.2065,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "2b package wasn't brought down, but tag says attempted 6:41 but no one buzzed her. It was just sitting on 2nd fl landing by rail, but red rush sticker still on "
          }
        ],
        "generationDocket": {
          "status": "landed",
          "holdClass": null,
          "headline": "Generator V2 landed a registered rewrite.",
          "reasons": [],
          "candidateCount": 4,
          "winningCandidateId": "base"
        },
        "winningCandidateId": "base"
      },
      "semanticContract": {
        "transferClass": "structural",
        "realizationTier": "lexical-structural",
        "changedDimensions": [
          "abbreviation-posture",
          "connector-stance",
          "contraction-posture",
          "lexical-register",
          "orthography-posture",
          "punctuation-shape",
          "sentence-count",
          "sentence-mean",
          "sentence-spread",
          "surface-marker-posture"
        ],
        "lexemeSwapFamilies": [],
        "relationInventory": [
          "additive:0",
          "causal:0",
          "clarifying:0",
          "contrastive:2",
          "resumptive:1",
          "temporal:1"
        ],
        "structuralOperations": [
          "clause-texture",
          "merge-pairs"
        ],
        "lexicalOperations": [],
        "connectorStrategy": "contrastive",
        "contractionStrategy": "hold",
        "propositionCoverage": 1,
        "actorCoverage": 1,
        "actionCoverage": 1,
        "objectCoverage": 0.917,
        "polarityMismatches": 0,
        "tenseMismatches": 1,
        "protectedAnchorIntegrity": 1
      }
    },
    "volunteer-cleanup-professional-message-under-rushed-mobile": {
      "id": "volunteer-cleanup-professional-message-under-rushed-mobile",
      "category": "retrieval-same-fact",
      "strength": 0.88,
      "sourceText": "Team, here is the cleanup flow for Saturday so we do not lose the first hour to improvisation. Please check in at the west fence table when you arrive, even if you already know the site. We are starting with glass pickup, pallet pull, pantry-post reset, and salvage sorting. Tool lanes are fixed on purpose: shovels at the fence, brooms at the tarp, saws under canopy B, and paint only if the wind holds. Gloves, water, and closed-toe shoes are required. If you forgot any of those, tell me before you start rather than trying to work around it. Kids can help at labeling and pantry sort, but they stay clear of saws and thinner. We stop for inventory at 10:15 because a clean handoff matters more than heroic freelancing.",
      "donorText": "if youre late thats ok just dont start random jobs. check in west fence table first. glass + pallets first pass. saws stay under canopy b, kids stay off solvent side, paint only if wind chills out. 10:15 inventory stop still stands. pls bring water for real, not saying it to be annoying",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.88,
        "profile": {
          "avgSentenceLength": 8.83,
          "sentenceCount": 6,
          "contractionDensity": 0,
          "punctuationDensity": 0.17,
          "contentWordComplexity": 0.231,
          "modifierDensity": 0.048,
          "directness": 0.86,
          "abstractionPosture": 0
        }
      },
      "retrievalTrace": {
        "sourceText": "Team, here is the cleanup flow for Saturday so we do not lose the first hour to improvisation. Please check in at the west fence table when you arrive, even if you already know the site. We are starting with glass pickup, pallet pull, pantry-post reset, and salvage sorting. Tool lanes are fixed on purpose: shovels at the fence, brooms at the tarp, saws under canopy B, and paint only if the wind holds. Gloves, water, and closed-toe shoes are required. If you forgot any of those, tell me before you start rather than trying to work around it. Kids can help at labeling and pantry sort, but they stay clear of saws and thinner. We stop for inventory at 10:15 because a clean handoff matters more than heroic freelancing.",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.8,
          "profile": {
            "avgSentenceLength": 8.15,
            "sentenceCount": 8,
            "contractionDensity": 0.011,
            "punctuationDensity": 0.178,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.247,
            "modifierDensity": 0.044,
            "hedgeDensity": 0.018,
            "directness": 0.838,
            "abstractionPosture": 0.5,
            "latinatePreference": 0.047,
            "recurrencePressure": 0.167
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 8,
            "clauseCount": 14,
            "literalSpans": [
              {
                "value": "10:15",
                "placeholder": "__PROTLIT_A__"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Team, here is the cleanup flow for Saturday so we do not lose the first hour to improvisation",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Team, here is the cleanup flow for Saturday",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "is",
                  "actor": "the cleanup",
                  "action": "is",
                  "object": "cleanup flow saturday",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s0c1",
                  "text": "we do not lose the first hour to improvisation",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "do",
                  "actor": "we",
                  "action": "do",
                  "object": "lose first hour improvisation",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "Please check in at the west fence table when you arrive, even if you already know the site",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "Please check in at the west fence table",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "check",
                  "actor": "the west",
                  "action": "check",
                  "object": "at west fence table",
                  "modifiers": [
                    "table"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s1c1",
                  "text": "you arrive, even",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "arrive",
                  "actor": "you",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "arrive"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s1c2",
                  "text": "you already know the site",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "already",
                  "actor": "you",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "We are starting with glass pickup, pallet pull, pantry-post reset, and salvage sorting",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "We are starting with glass pickup, pallet pull, pantry-post reset, and salvage sorting",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "progressive",
                  "propositionHead": "pull",
                  "actor": "We",
                  "action": "pull",
                  "object": "pantry post reset salvage sorting",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "Tool lanes are fixed on purpose: shovels at the fence, brooms at the tarp, saws under canopy B, and paint only if the wind holds",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "Tool lanes are fixed on purpose: shovels at the fence, brooms at the tarp, saws under canopy B, and paint only",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "fixed",
                  "actor": "the fence",
                  "action": "fixed",
                  "object": "purpose shovels at fence brooms",
                  "modifiers": [
                    "only"
                  ],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                },
                {
                  "id": "s3c1",
                  "text": "the wind holds",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "wind",
                  "actor": "the wind",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "Gloves, water, and closed-toe shoes are required",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "Gloves, water, and closed-toe shoes are required",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "required",
                  "actor": "",
                  "action": "required",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "If you forgot any of those, tell me before you start rather than trying to work around it",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "If you forgot any of those, tell me before you start rather than trying to work around it",
                  "relationToPrev": "start",
                  "clauseType": "subordinate",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "tell",
                  "actor": "you",
                  "action": "tell",
                  "object": "me before start than trying",
                  "modifiers": [],
                  "hedgeMarkers": [
                    "uncertainty",
                    "intensification"
                  ]
                }
              ]
            },
            {
              "id": "s6",
              "raw": "Kids can help at labeling and pantry sort, but they stay clear of saws and thinner",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s6c0",
                  "text": "Kids can help at labeling and pantry sort",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "can",
                  "actor": "",
                  "action": "can",
                  "object": "help at labeling pantry",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s6c1",
                  "text": "they stay clear of saws and thinner",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "stay",
                  "actor": "they",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s7",
              "raw": "We stop for inventory at __PROTLIT_A__ because a clean handoff matters more than heroic freelancing.",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s7c0",
                  "text": "We stop for inventory at __PROTLIT_A__",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "stop",
                  "actor": "We",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s7c1",
                  "text": "a clean handoff matters more than heroic freelancing",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "clean",
                  "actor": "a clean",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "heroic"
                  ],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "opportunityProfile": {
          "sentenceSplit": 2,
          "sentenceMerge": 7,
          "contraction": 2,
          "connector": 4,
          "lineBreak": 7,
          "abbreviation": 0,
          "orthography": 0,
          "fragment": 0,
          "conversational": 1,
          "additive": 5,
          "contrastive": 1,
          "causal": 2,
          "temporal": 2,
          "clarifying": 0,
          "resumptive": 0
        },
        "planSummary": {
          "transferMode": "compress",
          "structuralOperationsSelected": [
            "baseline-split",
            "planned-sentence-split",
            "sentence-structure",
            "clause-join-split",
            "structural-rescue"
          ],
          "lexicalRegisterOperationsSelected": [
            "baseline-contraction",
            "baseline-voice-realization",
            "connector-stance-lexicon",
            "punctuation-finish",
            "lexical-register-rescue"
          ],
          "connectorStrategy": "additive",
          "contractionStrategy": "increase",
          "relationInventory": {
            "additive": 5,
            "contrastive": 1,
            "causal": 2,
            "temporal": 2,
            "clarifying": 0,
            "resumptive": 0
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": -8.479999999999999
          },
          "discourseGoals": {
            "contractionDelta": 0.011,
            "hedgeDelta": 0.002999999999999999
          },
          "registerGoals": {
            "contentWordComplexityDelta": -0.04899999999999999,
            "modifierDensityDelta": 0.009999999999999995,
            "directnessDelta": 0.15799999999999992,
            "abstractionDelta": 0,
            "latinateDelta": 0.0010000000000000009,
            "registerMode": "compressed"
          },
          "operationBudget": {
            "splitSentence": 17,
            "mergeSentence": 0,
            "swapConnector": 2,
            "applyHedge": 0,
            "realizeLexicon": 4
          }
        },
        "candidateSummary": {
          "selected": {
            "spec": "mixed-structural",
            "score": 324.946,
            "passesApplied": [
              "baseline-split",
              "baseline-contraction",
              "baseline-voice-realization",
              "planned-sentence-split",
              "sentence-structure",
              "clause-join-split",
              "connector-stance-lexicon",
              "punctuation-finish",
              "cleanup-restore",
              "structural-rescue",
              "lexical-register-rescue"
            ],
            "rescuePasses": [
              "structural-rescue",
              "lexical-register-rescue"
            ],
            "changedDimensions": [
              "sentence-mean",
              "sentence-count",
              "sentence-spread",
              "contraction-posture",
              "connector-stance",
              "lexical-register",
              "abbreviation-posture",
              "orthography-posture",
              "fragment-posture",
              "surface-marker-posture",
              "punctuation-shape"
            ],
            "qualityGatePassed": false,
            "notes": [
              "Structural opportunity existed but the current candidate collapsed into additive drift."
            ]
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 217.434,
              "passesApplied": [
                "discourse-frame",
                "stance-texture",
                "contraction"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "contraction-posture",
                "connector-stance",
                "lexical-register",
                "abbreviation-posture",
                "orthography-posture",
                "surface-marker-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": false,
              "notes": [
                "Structural opportunity existed but the current candidate collapsed into additive drift."
              ]
            },
            {
              "spec": "mixed-structural",
              "score": 324.946,
              "passesApplied": [
                "baseline-split",
                "baseline-contraction",
                "baseline-voice-realization",
                "planned-sentence-split",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "punctuation-finish",
                "cleanup-restore",
                "structural-rescue",
                "lexical-register-rescue"
              ],
              "rescuePasses": [
                "structural-rescue",
                "lexical-register-rescue"
              ],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "contraction-posture",
                "connector-stance",
                "lexical-register",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "surface-marker-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": false,
              "notes": [
                "Structural opportunity existed but the current candidate collapsed into additive drift."
              ]
            },
            {
              "spec": "split-heavy",
              "score": 324.946,
              "passesApplied": [
                "baseline-split",
                "baseline-contraction",
                "baseline-voice-realization",
                "planned-sentence-split",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "punctuation-finish",
                "cleanup-restore",
                "structural-rescue",
                "lexical-register-rescue"
              ],
              "rescuePasses": [
                "structural-rescue",
                "lexical-register-rescue"
              ],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "contraction-posture",
                "connector-stance",
                "lexical-register",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "surface-marker-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": false,
              "notes": [
                "Structural opportunity existed but the current candidate collapsed into additive drift."
              ]
            },
            {
              "spec": "connector-stance-heavy",
              "score": 257.328,
              "passesApplied": [
                "baseline-split",
                "baseline-contraction",
                "baseline-voice-realization",
                "planned-sentence-split",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "cleanup-restore",
                "structural-rescue",
                "lexical-register-rescue"
              ],
              "rescuePasses": [
                "structural-rescue",
                "lexical-register-rescue"
              ],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "contraction-posture",
                "connector-stance",
                "lexical-register",
                "abbreviation-posture",
                "orthography-posture",
                "surface-marker-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": false,
              "notes": [
                "Structural opportunity existed but the current candidate collapsed into additive drift."
              ]
            },
            {
              "spec": "lexical-register-heavy",
              "score": 257.328,
              "passesApplied": [
                "baseline-split",
                "baseline-contraction",
                "baseline-voice-realization",
                "planned-sentence-split",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "cleanup-restore",
                "structural-rescue",
                "lexical-register-rescue"
              ],
              "rescuePasses": [
                "structural-rescue",
                "lexical-register-rescue"
              ],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "contraction-posture",
                "connector-stance",
                "lexical-register",
                "abbreviation-posture",
                "orthography-posture",
                "surface-marker-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": false,
              "notes": [
                "Structural opportunity existed but the current candidate collapsed into additive drift."
              ]
            }
          ]
        },
        "finalRealization": {
          "text": "Team. Here is the cleanup flow for Saturday. So we dont lose the first hr to improvisation. Pls check in at the west fence table when you arrive. Even if you already know the site. We're starting w/ glass pickup, pallet pull, pantry-post reset.  Salvage sorting. Tool lanes are fixed on purpose. Shovels at the fence, brooms at the tarp, saws under canopy B.  Paint only if the wind holds. Gloves, water.  Closed-toe shoes are required. If you forgot any of those, tell me before you start rather than trying to work around it. Kids can help at labeling and pantry sort,. But they stay clear of saws + thinner. We stop for inventory at 10:15 bc a clean handoff matters more than heroic freelancing.",
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "contraction-posture",
            "connector-stance",
            "lexical-register",
            "abbreviation-posture",
            "fragment-posture",
            "punctuation-shape"
          ],
          "lexemeSwaps": [],
          "semanticRisk": 0.42,
          "donorProgress": {
            "eligible": true,
            "sourceDonorDistance": 4.929,
            "outputDonorDistance": 2.451,
            "donorImprovement": 2.478,
            "donorImprovementRatio": 0.503,
            "sourceOutputLexicalOverlap": 0.89
          },
          "rescuePasses": [
            "structural-rescue",
            "lexical-register-rescue",
            "partial-rescue",
            "td613-aperture-warning"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "semanticAudit": {
          "propositionCoverage": 1,
          "actorCoverage": 0.95,
          "actionCoverage": 1,
          "objectCoverage": 0.954,
          "polarityMismatches": 0,
          "tenseMismatches": 0,
          "protectedAnchorIntegrity": 1,
          "clauseAudits": [
            {
              "sourceClauseId": "s0c0",
              "matchedClauseId": "s1c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.083
            },
            {
              "sourceClauseId": "s0c1",
              "matchedClauseId": "s2c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0,
              "globalBagScore": 0
            },
            {
              "sourceClauseId": "s1c0",
              "matchedClauseId": "s3c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.139
            },
            {
              "sourceClauseId": "s1c1",
              "matchedClauseId": "s3c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.028
            },
            {
              "sourceClauseId": "s1c2",
              "matchedClauseId": "s4c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.028
            },
            {
              "sourceClauseId": "s2c0",
              "matchedClauseId": "s5c0+s6c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.8,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.833,
              "globalBagScore": 0.135
            },
            {
              "sourceClauseId": "s3c0",
              "matchedClauseId": "s7c0+s8c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.8,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.667,
              "globalBagScore": 0.135
            },
            {
              "sourceClauseId": "s3c1",
              "matchedClauseId": "s9c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.028
            },
            {
              "sourceClauseId": "s4c0",
              "matchedClauseId": "s11c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.028
            },
            {
              "sourceClauseId": "s5c0",
              "matchedClauseId": "s12c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.167
            },
            {
              "sourceClauseId": "s6c0",
              "matchedClauseId": "s13c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.111
            },
            {
              "sourceClauseId": "s6c1",
              "matchedClauseId": "s14c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.028
            },
            {
              "sourceClauseId": "s7c0",
              "matchedClauseId": "s15c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.5,
              "globalBagScore": 0.028
            },
            {
              "sourceClauseId": "s7c1",
              "matchedClauseId": "s15c0",
              "propositionCoverage": 1,
              "actorCoverage": 0.3,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.333,
              "globalBagScore": 0.027
            }
          ],
          "sourceClauseCount": 14,
          "outputClauseCount": 19
        },
        "protectedAnchorAudit": {
          "totalAnchors": 1,
          "resolvedAnchors": 1,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 16,
            "clauseCount": 19,
            "literalSpans": [
              {
                "value": "10:15",
                "placeholder": "__PROTLIT_A__"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Team",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Team",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "team",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "Here is the cleanup flow for Saturday",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "Here is the cleanup flow for Saturday",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "is",
                  "actor": "the cleanup",
                  "action": "is",
                  "object": "cleanup flow saturday",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "So we dont lose the first hr to improvisation",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "So we dont lose the first hr to improvisation",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "dont",
                  "actor": "we",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "Pls check in at the west fence table when you arrive",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "Pls check in at the west fence table",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "check",
                  "actor": "the west",
                  "action": "check",
                  "object": "at west fence table",
                  "modifiers": [
                    "table"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s3c1",
                  "text": "you arrive",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "arrive",
                  "actor": "you",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "arrive"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "Even if you already know the site",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "Even",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "even",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s4c1",
                  "text": "you already know the site",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "already",
                  "actor": "you",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "We're starting w/ glass pickup, pallet pull, pantry-post reset",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "We're starting w/ glass pickup, pallet pull, pantry-post reset",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "pull",
                  "actor": "We",
                  "action": "pull",
                  "object": "pantry post reset",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s6",
              "raw": "Salvage sorting",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s6c0",
                  "text": "Salvage sorting",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "salvage",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s7",
              "raw": "Tool lanes are fixed on purpose",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s7c0",
                  "text": "Tool lanes are fixed on purpose",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "fixed",
                  "actor": "",
                  "action": "fixed",
                  "object": "purpose",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s8",
              "raw": "Shovels at the fence, brooms at the tarp, saws under canopy B",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s8c0",
                  "text": "Shovels at the fence, brooms at the tarp, saws under canopy B",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "shovels",
                  "actor": "the fence",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s9",
              "raw": "Paint only if the wind holds",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s9c0",
                  "text": "Paint only",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "paint",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "only"
                  ],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                },
                {
                  "id": "s9c1",
                  "text": "the wind holds",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "wind",
                  "actor": "the wind",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s10",
              "raw": "Gloves, water",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s10c0",
                  "text": "Gloves, water",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "gloves",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s11",
              "raw": "Closed-toe shoes are required",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s11c0",
                  "text": "Closed-toe shoes are required",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "required",
                  "actor": "",
                  "action": "required",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s12",
              "raw": "If you forgot any of those, tell me before you start rather than trying to work around it",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s12c0",
                  "text": "If you forgot any of those, tell me before you start rather than trying to work around it",
                  "relationToPrev": "start",
                  "clauseType": "subordinate",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "tell",
                  "actor": "you",
                  "action": "tell",
                  "object": "me before start than trying",
                  "modifiers": [],
                  "hedgeMarkers": [
                    "uncertainty",
                    "intensification"
                  ]
                }
              ]
            },
            {
              "id": "s13",
              "raw": "Kids can help at labeling and pantry sort,",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s13c0",
                  "text": "Kids can help at labeling and pantry sort,",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "can",
                  "actor": "",
                  "action": "can",
                  "object": "help at labeling pantry",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s14",
              "raw": "But they stay clear of saws + thinner",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s14c0",
                  "text": "But they stay clear of saws + thinner",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "stay",
                  "actor": "they",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s15",
              "raw": "We stop for inventory at 10:15 bc a clean handoff matters more than heroic freelancing.",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s15c0",
                  "text": "We stop for inventory at 10:15 bc a clean handoff matters more than heroic freelancing",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "stop",
                  "actor": "We",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "heroic"
                  ],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "realizationSummary": {
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "contraction-posture",
            "connector-stance",
            "lexical-register",
            "abbreviation-posture",
            "fragment-posture",
            "punctuation-shape"
          ],
          "lexemeSwaps": [],
          "semanticRisk": 0.42,
          "donorProgress": {
            "eligible": true,
            "sourceDonorDistance": 4.929,
            "outputDonorDistance": 2.451,
            "donorImprovement": 2.478,
            "donorImprovementRatio": 0.503,
            "sourceOutputLexicalOverlap": 0.89
          },
          "realizationNotes": [
            "Register shift surfaced through lexical-register, abbreviation-posture, orthography-posture, fragment-posture, surface-marker-posture.",
            "Semantic risk is elevated; review the realized output before relying on it."
          ],
          "rescuePasses": [
            "structural-rescue",
            "lexical-register-rescue",
            "partial-rescue",
            "td613-aperture-warning"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "generatorVersion": "v2",
        "sourceClass": "formal-correspondence",
        "candidateLedger": [
          {
            "id": "base",
            "envelopeId": "spark",
            "status": "eligible",
            "score": 0.8398,
            "rewriteStrength": 1,
            "targetFit": 0.4994,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Team, here is the cleanup flow for Saturday so we dont lose the first hr to improvisation. Pls check in at the west fence table when you arrive, even if you alr"
          },
          {
            "id": "amplified",
            "envelopeId": "spark",
            "status": "eligible",
            "score": 0.8403,
            "rewriteStrength": 1,
            "targetFit": 0.5009,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Team. Here is the cleanup flow for Saturday. So we dont lose the first hr to improvisation. Pls check in at the west fence table when you arrive. Even if you al"
          },
          {
            "id": "contrast",
            "envelopeId": "spark",
            "status": "eligible",
            "score": 0.8359,
            "rewriteStrength": 1,
            "targetFit": 0.4871,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Team. Here is the cleanup flow for Saturday. So we dont lose the first hr to improvisation. Pls check in at the west fence table when you arrive. Even if you al"
          },
          {
            "id": "conservative",
            "envelopeId": "spark",
            "status": "selected",
            "score": 0.8458,
            "rewriteStrength": 1,
            "targetFit": 0.5182,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Team. Here is the cleanup flow for Saturday. So we dont lose the first hr to improvisation. Pls check in at the west fence table when you arrive. Even if you al"
          }
        ],
        "generationDocket": {
          "status": "landed",
          "holdClass": null,
          "headline": "Generator V2 landed a registered rewrite.",
          "reasons": [],
          "candidateCount": 4,
          "winningCandidateId": "conservative"
        },
        "winningCandidateId": "conservative"
      },
      "semanticContract": {
        "transferClass": "structural",
        "realizationTier": "lexical-structural",
        "changedDimensions": [
          "abbreviation-posture",
          "connector-stance",
          "contraction-posture",
          "fragment-posture",
          "lexical-register",
          "punctuation-shape",
          "sentence-count",
          "sentence-mean"
        ],
        "lexemeSwapFamilies": [],
        "relationInventory": [
          "additive:5",
          "causal:2",
          "clarifying:0",
          "contrastive:1",
          "resumptive:0",
          "temporal:2"
        ],
        "structuralOperations": [
          "baseline-split",
          "clause-join-split",
          "planned-sentence-split",
          "sentence-structure",
          "structural-rescue"
        ],
        "lexicalOperations": [
          "baseline-contraction",
          "baseline-voice-realization",
          "connector-stance-lexicon",
          "lexical-register-rescue",
          "punctuation-finish"
        ],
        "connectorStrategy": "additive",
        "contractionStrategy": "increase",
        "propositionCoverage": 1,
        "actorCoverage": 0.95,
        "actionCoverage": 1,
        "objectCoverage": 0.954,
        "polarityMismatches": 0,
        "tenseMismatches": 0,
        "protectedAnchorIntegrity": 1
      }
    },
    "volunteer-cleanup-rushed-mobile-under-professional-message": {
      "id": "volunteer-cleanup-rushed-mobile-under-professional-message",
      "category": "retrieval-same-fact",
      "strength": 0.88,
      "sourceText": "if youre late thats ok just dont start random jobs. check in west fence table first. glass + pallets first pass. saws stay under canopy b, kids stay off solvent side, paint only if wind chills out. 10:15 inventory stop still stands. pls bring water for real, not saying it to be annoying",
      "donorText": "Team, here is the cleanup flow for Saturday so we do not lose the first hour to improvisation. Please check in at the west fence table when you arrive, even if you already know the site. We are starting with glass pickup, pallet pull, pantry-post reset, and salvage sorting. Tool lanes are fixed on purpose: shovels at the fence, brooms at the tarp, saws under canopy B, and paint only if the wind holds. Gloves, water, and closed-toe shoes are required. If you forgot any of those, tell me before you start rather than trying to work around it. Kids can help at labeling and pantry sort, but they stay clear of saws and thinner. We stop for inventory at 10:15 because a clean handoff matters more than heroic freelancing.",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.88,
        "profile": {
          "avgSentenceLength": 16.63,
          "sentenceCount": 8,
          "contractionDensity": 0,
          "punctuationDensity": 0.18,
          "contentWordComplexity": 0.296,
          "modifierDensity": 0.034,
          "directness": 0.68,
          "abstractionPosture": 0
        }
      },
      "retrievalTrace": {
        "sourceText": "if youre late thats ok just dont start random jobs. check in west fence table first. glass + pallets first pass. saws stay under canopy b, kids stay off solvent side, paint only if wind chills out. 10:15 inventory stop still stands. pls bring water for real, not saying it to be annoying",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.88,
          "profile": {
            "avgSentenceLength": 16.46,
            "sentenceCount": 6,
            "contractionDensity": 0,
            "punctuationDensity": 0.18,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.28,
            "modifierDensity": 0.037,
            "hedgeDensity": 0.016,
            "directness": 0.723,
            "abstractionPosture": 0.5,
            "latinatePreference": 0.046,
            "recurrencePressure": 0.21
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 6,
            "clauseCount": 7,
            "literalSpans": [
              {
                "value": "10:15",
                "placeholder": "__PROTLIT_A__"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "if youre late thats ok just dont start random jobs",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "if youre late thats ok just dont start random jobs",
                  "relationToPrev": "start",
                  "clauseType": "subordinate",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "youre",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                }
              ]
            },
            {
              "id": "s1",
              "raw": "check in west fence table first",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "check in west fence table first",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "check",
                  "actor": "",
                  "action": "check",
                  "object": "west fence table first",
                  "modifiers": [
                    "table"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "glass + pallets first pass",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "glass + pallets first pass",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "glass",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "saws stay under canopy b, kids stay off solvent side, paint only if wind chills out",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "saws stay under canopy b, kids stay off solvent side, paint only",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "saws",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "only"
                  ],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                },
                {
                  "id": "s3c1",
                  "text": "wind chills out",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "wind",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "__PROTLIT_A__ inventory stop still stands",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "__PROTLIT_A__ inventory stop still stands",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "protlit",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "pls bring water for real, not saying it to be annoying",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "pls bring water for real, not saying it to be annoying",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "bring",
                  "actor": "it",
                  "action": "bring",
                  "object": "water real saying annoying",
                  "modifiers": [
                    "real"
                  ],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "opportunityProfile": {
          "sentenceSplit": 0,
          "sentenceMerge": 5,
          "contraction": 0,
          "connector": 2,
          "lineBreak": 5,
          "abbreviation": 1,
          "orthography": 8,
          "fragment": 2,
          "conversational": 1,
          "additive": 0,
          "contrastive": 1,
          "causal": 0,
          "temporal": 0,
          "clarifying": 0,
          "resumptive": 1
        },
        "planSummary": {
          "transferMode": "expand",
          "structuralOperationsSelected": [
            "clause-texture"
          ],
          "lexicalRegisterOperationsSelected": [],
          "connectorStrategy": "contrastive",
          "contractionStrategy": "hold",
          "relationInventory": {
            "additive": 0,
            "contrastive": 1,
            "causal": 0,
            "temporal": 0,
            "clarifying": 0,
            "resumptive": 1
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": 7.630000000000001
          },
          "discourseGoals": {
            "contractionDelta": 0,
            "hedgeDelta": -0.002999999999999999
          },
          "registerGoals": {
            "contentWordComplexityDelta": 0.049000000000000016,
            "modifierDensityDelta": -0.011000000000000003,
            "directnessDelta": -0.137,
            "abstractionDelta": 0,
            "latinateDelta": -0.0020000000000000018,
            "registerMode": "compressed"
          },
          "operationBudget": {
            "splitSentence": 0,
            "mergeSentence": 8,
            "swapConnector": 2,
            "applyHedge": 2,
            "realizeLexicon": 5
          }
        },
        "candidateSummary": {
          "selected": {
            "spec": "ir-beam-search",
            "score": 480.73,
            "passesApplied": [
              "baseline-floor",
              "clause-texture"
            ],
            "rescuePasses": [],
            "changedDimensions": [
              "sentence-mean",
              "sentence-count",
              "sentence-spread",
              "connector-stance",
              "lexical-register",
              "modifier-density",
              "directness",
              "abbreviation-posture",
              "orthography-posture",
              "fragment-posture",
              "surface-marker-posture",
              "punctuation-shape"
            ],
            "qualityGatePassed": true,
            "notes": []
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 480.73,
              "passesApplied": [
                "baseline-floor",
                "clause-texture"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "modifier-density",
                "directness",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "surface-marker-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "mixed-structural",
              "score": 403.928,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "sentence-structure",
                "connector-stance-lexicon"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "modifier-density",
                "directness",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "merge-heavy",
              "score": 403.928,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "sentence-structure",
                "connector-stance-lexicon"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "modifier-density",
                "directness",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "connector-stance-heavy",
              "score": 403.928,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "sentence-structure",
                "connector-stance-lexicon"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "modifier-density",
                "directness",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "lexical-register-heavy",
              "score": 403.928,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "sentence-structure",
                "connector-stance-lexicon"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "modifier-density",
                "directness",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            }
          ]
        },
        "finalRealization": {
          "text": "If you are late that is okay please do not begin new tasks, and check in at the west fence table first. Glass, pallets require an initial pass; and saws stay under canopy b, kids stay off solvent side, paint only if wind chills out. 10:15 inventory stop still stands, but please bring water for real, not saying it to be annoying.",
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "sentence-spread",
            "connector-stance",
            "lexical-register",
            "modifier-density",
            "directness",
            "abbreviation-posture",
            "orthography-posture",
            "fragment-posture",
            "surface-marker-posture",
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "start",
              "from": "start",
              "to": "begin",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "donorProgress": {
            "eligible": true,
            "sourceDonorDistance": 4.847,
            "outputDonorDistance": 2.291,
            "donorImprovement": 2.556,
            "donorImprovementRatio": 0.527,
            "sourceOutputLexicalOverlap": 0.612
          },
          "rescuePasses": [
            "td613-aperture-warning"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "semanticAudit": {
          "propositionCoverage": 1,
          "actorCoverage": 1,
          "actionCoverage": 1,
          "objectCoverage": 0.964,
          "polarityMismatches": 1,
          "tenseMismatches": 0,
          "protectedAnchorIntegrity": 1,
          "clauseAudits": [
            {
              "sourceClauseId": "s0c0",
              "matchedClauseId": "s0c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0,
              "globalBagScore": 0
            },
            {
              "sourceClauseId": "s1c0",
              "matchedClauseId": "s0c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 1,
              "tenseMismatch": 0,
              "bagScore": 0.333,
              "globalBagScore": 0.167
            },
            {
              "sourceClauseId": "s2c0",
              "matchedClauseId": "s1c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0,
              "globalBagScore": 0
            },
            {
              "sourceClauseId": "s3c0",
              "matchedClauseId": "s1c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.063
            },
            {
              "sourceClauseId": "s3c1",
              "matchedClauseId": "s1c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0,
              "globalBagScore": 0
            },
            {
              "sourceClauseId": "s4c0",
              "matchedClauseId": "s1c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0,
              "globalBagScore": 0
            },
            {
              "sourceClauseId": "s5c0",
              "matchedClauseId": "s2c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.313
            }
          ],
          "sourceClauseCount": 7,
          "outputClauseCount": 4
        },
        "protectedAnchorAudit": {
          "totalAnchors": 1,
          "resolvedAnchors": 1,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 3,
            "clauseCount": 4,
            "literalSpans": [
              {
                "value": "10:15",
                "placeholder": "__PROTLIT_A__"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "If you are late that is okay please do not begin new tasks, and check in at the west fence table first",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "If you are late that is okay please do not begin new tasks, and check in at the west fence table first",
                  "relationToPrev": "start",
                  "clauseType": "subordinate",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "begin",
                  "actor": "you",
                  "action": "begin",
                  "object": "new tasks check at west",
                  "modifiers": [
                    "table"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "Glass, pallets require an initial pass; and saws stay under canopy b, kids stay off solvent side, paint only if wind chills out",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "Glass, pallets require an initial pass",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "require",
                  "actor": "an initial",
                  "action": "require",
                  "object": "initial pass",
                  "modifiers": [
                    "initial"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s1c1",
                  "text": "and saws stay under canopy b, kids stay off solvent side, paint only if wind chills out",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "saws",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "only"
                  ],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                }
              ]
            },
            {
              "id": "s2",
              "raw": "10:15 inventory stop still stands, but please bring water for real, not saying it to be annoying.",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "10:15 inventory stop still stands, but please bring water for real, not saying it to be annoying",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "bring",
                  "actor": "it",
                  "action": "bring",
                  "object": "water real saying annoying",
                  "modifiers": [
                    "real"
                  ],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "realizationSummary": {
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "sentence-spread",
            "connector-stance",
            "lexical-register",
            "modifier-density",
            "directness",
            "abbreviation-posture",
            "orthography-posture",
            "fragment-posture",
            "surface-marker-posture",
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "start",
              "from": "start",
              "to": "begin",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "donorProgress": {
            "eligible": true,
            "sourceDonorDistance": 4.847,
            "outputDonorDistance": 2.291,
            "donorImprovement": 2.556,
            "donorImprovementRatio": 0.527,
            "sourceOutputLexicalOverlap": 0.612
          },
          "realizationNotes": [
            "1 lexical family swap landed.",
            "Register shift surfaced through lexical-register, modifier-density, directness, abbreviation-posture, orthography-posture, fragment-posture, surface-marker-posture.",
            "Semantic risk is elevated; review the realized output before relying on it."
          ],
          "rescuePasses": [
            "td613-aperture-warning"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "generatorVersion": "v2",
        "sourceClass": "formal-correspondence",
        "candidateLedger": [
          {
            "id": "base",
            "envelopeId": "matron",
            "status": "selected",
            "score": 0.8425,
            "rewriteStrength": 1,
            "targetFit": 0.5079,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "If you are late that is okay please do not begin new tasks, and check in at the west fence table first. Glass, pallets require an initial pass; and saws stay un"
          },
          {
            "id": "amplified",
            "envelopeId": "matron",
            "status": "eligible",
            "score": 0.7594,
            "rewriteStrength": 1,
            "targetFit": 0.2482,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "If you are late that is ok just do not kick off random jobs; and check in at the west fence table first; glass, pallets require an initial pass. And saws stay u"
          },
          {
            "id": "contrast",
            "envelopeId": "matron",
            "status": "eligible",
            "score": 0.7787,
            "rewriteStrength": 1,
            "targetFit": 0.3085,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "If you are late that is ok just do not kick off random jobs, and check in west fence table first. Glass, pallets first pass; saws stay under canopy b, kids stay"
          },
          {
            "id": "conservative",
            "envelopeId": "matron",
            "status": "eligible",
            "score": 0.7755,
            "rewriteStrength": 1,
            "targetFit": 0.2985,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "If you are late that is okay please do not begin new tasks, and check in at the west fence table first. Glass, pallets require an initial pass; and saws stay un"
          }
        ],
        "generationDocket": {
          "status": "landed",
          "holdClass": null,
          "headline": "Generator V2 landed a registered rewrite.",
          "reasons": [],
          "candidateCount": 4,
          "winningCandidateId": "base"
        },
        "winningCandidateId": "base"
      },
      "semanticContract": {
        "transferClass": "structural",
        "realizationTier": "lexical-structural",
        "changedDimensions": [
          "abbreviation-posture",
          "connector-stance",
          "directness",
          "fragment-posture",
          "lexical-register",
          "modifier-density",
          "orthography-posture",
          "punctuation-shape",
          "sentence-count",
          "sentence-mean",
          "sentence-spread",
          "surface-marker-posture"
        ],
        "lexemeSwapFamilies": [
          "start"
        ],
        "relationInventory": [
          "additive:0",
          "causal:0",
          "clarifying:0",
          "contrastive:1",
          "resumptive:1",
          "temporal:0"
        ],
        "structuralOperations": [
          "clause-texture"
        ],
        "lexicalOperations": [],
        "connectorStrategy": "contrastive",
        "contractionStrategy": "hold",
        "propositionCoverage": 1,
        "actorCoverage": 1,
        "actionCoverage": 1,
        "objectCoverage": 0.964,
        "polarityMismatches": 1,
        "tenseMismatches": 0,
        "protectedAnchorIntegrity": 1
      }
    },
    "committee-budget-formal-record-under-rushed-mobile": {
      "id": "committee-budget-formal-record-under-rushed-mobile",
      "category": "retrieval-same-fact",
      "strength": 0.88,
      "sourceText": "The finance committee met at 4:05 PM to review the bridge budget after central administration extended the hiring freeze through Q3. The immediate effect is that the student-support coordinator line remains unfunded for another twelve weeks, even though the underlying service demand has not eased. Members agreed that the program can absorb a temporary delay in furniture and print costs, but not a full quarter without intake coverage. Three short-term options were discussed: reclassify one vacant analyst line for bridge staffing, reduce evening service hours, or draw against restricted reserves pending dean approval. No option was adopted in session. What did resolve was the frame: this is not a generic belt-tightening exercise. It is a staffing exposure problem with public-facing consequences, and the next memo needs to say that without overstating certainty. Action items: revised table by Thursday, reserve-rule clarification from finance, and a staffing scenario note that distinguishes pause from actual service reduction.",
      "donorText": "freeze runs thru q3. means coord line stays empty 12 more wks unless we bridge it. room was basically: cut print/furniture if needed, dont fake that intake can run w no staffing hit. 3 options still analyst line / evening hrs / reserves w dean ok. revised table thurs after finance answers reserve rule",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.88,
        "profile": {
          "avgSentenceLength": 10.6,
          "sentenceCount": 5,
          "contractionDensity": 0,
          "punctuationDensity": 0.113,
          "contentWordComplexity": 0.252,
          "modifierDensity": 0.065,
          "directness": 0,
          "abstractionPosture": 0.5
        }
      },
      "retrievalTrace": {
        "sourceText": "The finance committee met at 4:05 PM to review the bridge budget after central administration extended the hiring freeze through Q3. The immediate effect is that the student-support coordinator line remains unfunded for another twelve weeks, even though the underlying service demand has not eased. Members agreed that the program can absorb a temporary delay in furniture and print costs, but not a full quarter without intake coverage. Three short-term options were discussed: reclassify one vacant analyst line for bridge staffing, reduce evening service hours, or draw against restricted reserves pending dean approval. No option was adopted in session. What did resolve was the frame: this is not a generic belt-tightening exercise. It is a staffing exposure problem with public-facing consequences, and the next memo needs to say that without overstating certainty. Action items: revised table by Thursday, reserve-rule clarification from finance, and a staffing scenario note that distinguishes pause from actual service reduction.",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.88,
          "profile": {
            "avgSentenceLength": 10.8,
            "sentenceCount": 8,
            "contractionDensity": 0,
            "punctuationDensity": 0.114,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.307,
            "modifierDensity": 0.062,
            "hedgeDensity": 0,
            "directness": 0,
            "abstractionPosture": 0.5,
            "latinatePreference": 0.035,
            "recurrencePressure": 0.114
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 8,
            "clauseCount": 9,
            "literalSpans": [
              {
                "value": "4:05 PM",
                "placeholder": "__PROTLIT_A__"
              },
              {
                "value": "Q3",
                "placeholder": "__PROTLIT_B__"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "The finance committee met at __PROTLIT_A__ to review the bridge budget after central administration extended the hiring freeze through __PROTLIT_B__",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "The finance committee met at __PROTLIT_A__ to review the bridge budget after central administration extended the hiring freeze through __PROTLIT_B__",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "review",
                  "actor": "The finance",
                  "action": "review",
                  "object": "bridge budget after central administration",
                  "modifiers": [
                    "central"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "The immediate effect is that the student-support coordinator line remains unfunded for another twelve weeks, even though the underlying service demand has not eased",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "The immediate effect is that the student-support coordinator line remains unfunded for another twelve weeks",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "is",
                  "actor": "The immediate",
                  "action": "is",
                  "object": "student support coordinator line remains",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s1c1",
                  "text": "the underlying service demand has not eased",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "has",
                  "actor": "the underlying",
                  "action": "has",
                  "object": "eased",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "Members agreed that the program can absorb a temporary delay in furniture and print costs, but not a full quarter without intake coverage",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "Members agreed that the program can absorb a temporary delay in furniture and print costs, but not a full quarter without intake coverage",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "can",
                  "actor": "that",
                  "action": "can",
                  "object": "absorb temporary delay furniture print",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "Three short-term options were discussed: reclassify one vacant analyst line for bridge staffing, reduce evening service hours, or draw against restricted reserves pending dean approval",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "Three short-term options were discussed: reclassify one vacant analyst line for bridge staffing, reduce evening service hours, or draw against restricted reserves pending dean approval",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "were",
                  "actor": "",
                  "action": "were",
                  "object": "discussed reclassify one vacant analyst",
                  "modifiers": [
                    "approval"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "No option was adopted in session",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "No option was adopted in session",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "was",
                  "actor": "",
                  "action": "was",
                  "object": "adopted session",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "What did resolve was the frame: this is not a generic belt-tightening exercise",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "What did resolve was the frame: this is not a generic belt-tightening exercise",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "resolve",
                  "actor": "the frame",
                  "action": "resolve",
                  "object": "frame generic belt tightening exercise",
                  "modifiers": [
                    "generic"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s6",
              "raw": "It is a staffing exposure problem with public-facing consequences, and the next memo needs to say that without overstating certainty",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s6c0",
                  "text": "It is a staffing exposure problem with public-facing consequences, and the next memo needs to say that without overstating certainty",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "needs",
                  "actor": "It",
                  "action": "needs",
                  "object": "say without overstating certainty",
                  "modifiers": [
                    "public"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s7",
              "raw": "Action items: revised table by Thursday, reserve-rule clarification from finance, and a staffing scenario note that distinguishes pause from actual service reduction.",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s7c0",
                  "text": "Action items: revised table by Thursday, reserve-rule clarification from finance, and a staffing scenario note that distinguishes pause from actual service reduction",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "pause",
                  "actor": "a staffing",
                  "action": "pause",
                  "object": "from actual service reduction",
                  "modifiers": [
                    "table",
                    "actual"
                  ],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "opportunityProfile": {
          "sentenceSplit": 4,
          "sentenceMerge": 7,
          "contraction": 1,
          "connector": 7,
          "lineBreak": 7,
          "abbreviation": 0,
          "orthography": 0,
          "fragment": 0,
          "conversational": 0,
          "additive": 3,
          "contrastive": 2,
          "causal": 0,
          "temporal": 1,
          "clarifying": 0,
          "resumptive": 0
        },
        "planSummary": {
          "transferMode": "compress",
          "structuralOperationsSelected": [
            "baseline-split"
          ],
          "lexicalRegisterOperationsSelected": [
            "baseline-voice-realization",
            "connector-stance-lexicon"
          ],
          "connectorStrategy": "additive",
          "contractionStrategy": "hold",
          "relationInventory": {
            "additive": 3,
            "contrastive": 2,
            "causal": 0,
            "temporal": 1,
            "clarifying": 0,
            "resumptive": 0
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": -9.2
          },
          "discourseGoals": {
            "contractionDelta": 0,
            "hedgeDelta": 0
          },
          "registerGoals": {
            "contentWordComplexityDelta": -0.177,
            "modifierDensityDelta": 0.010000000000000002,
            "directnessDelta": 0,
            "abstractionDelta": 0,
            "latinateDelta": -0.043,
            "registerMode": "compressed"
          },
          "operationBudget": {
            "splitSentence": 17,
            "mergeSentence": 0,
            "swapConnector": 2,
            "applyHedge": 0,
            "realizeLexicon": 5
          }
        },
        "candidateSummary": {
          "selected": {
            "spec": "mixed-structural",
            "score": 477.518,
            "passesApplied": [
              "baseline-split",
              "baseline-voice-realization",
              "connector-stance-lexicon"
            ],
            "rescuePasses": [],
            "changedDimensions": [
              "sentence-mean",
              "sentence-count",
              "sentence-spread",
              "connector-stance",
              "lexical-register",
              "content-word-complexity",
              "directness",
              "abbreviation-posture",
              "orthography-posture",
              "fragment-posture",
              "surface-marker-posture",
              "punctuation-shape"
            ],
            "qualityGatePassed": true,
            "notes": []
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 476.018,
              "passesApplied": [
                "baseline-floor",
                "clause-texture"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "content-word-complexity",
                "directness",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "surface-marker-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "mixed-structural",
              "score": 477.518,
              "passesApplied": [
                "baseline-split",
                "baseline-voice-realization",
                "connector-stance-lexicon"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "content-word-complexity",
                "directness",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "surface-marker-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "split-heavy",
              "score": 477.518,
              "passesApplied": [
                "baseline-split",
                "baseline-voice-realization",
                "connector-stance-lexicon"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "content-word-complexity",
                "directness",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "surface-marker-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "connector-stance-heavy",
              "score": 477.518,
              "passesApplied": [
                "baseline-split",
                "baseline-voice-realization",
                "connector-stance-lexicon"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "content-word-complexity",
                "directness",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "surface-marker-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "lexical-register-heavy",
              "score": 477.518,
              "passesApplied": [
                "baseline-split",
                "baseline-voice-realization",
                "connector-stance-lexicon"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "content-word-complexity",
                "directness",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "surface-marker-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            }
          ]
        },
        "finalRealization": {
          "text": "The finance committee met at 4:05 PM to check the bridge budget after central administration extended the hiring freeze thru Q3. The immediate effect is that the student-help coordinator line remains unfunded for another twelve wks. Even though the underlying service demand has not eased. Members agreed that the program can absorb a temp delay in furniture and print costs, but not a full quarter w/ o intake coverage. Three short-term options were discussed. Reclassify one vacant analyst line for bridge staffing, reduce evening service hrs, or draw against restricted reserves pending dean approval. No option was adopted in session. What did help was the frame. This is not a generic belt-tightening exercise. Its a staffing exposure problem w/ public-facing consequences.  The next memo needs to say that w/o overstating certainty. Action items. Revised table by Thursday, reserve-rule clarification from finance.  A staffing scenario note that distinguishes pause from actual service reduction.",
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "connector-stance",
            "lexical-register",
            "content-word-complexity",
            "directness",
            "abbreviation-posture",
            "fragment-posture",
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "help",
              "from": "support",
              "to": "help",
              "kind": "lexeme"
            },
            {
              "family": "check",
              "from": "review",
              "to": "check",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.42,
          "donorProgress": {
            "eligible": true,
            "sourceDonorDistance": 3.863,
            "outputDonorDistance": 3.117,
            "donorImprovement": 0.746,
            "donorImprovementRatio": 0.193,
            "sourceOutputLexicalOverlap": 0.859
          },
          "rescuePasses": [
            "td613-aperture-warning"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "semanticAudit": {
          "propositionCoverage": 0.989,
          "actorCoverage": 1,
          "actionCoverage": 0.979,
          "objectCoverage": 0.922,
          "polarityMismatches": 1,
          "tenseMismatches": 0,
          "protectedAnchorIntegrity": 1,
          "clauseAudits": [
            {
              "sourceClauseId": "s0c0",
              "matchedClauseId": "s0c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.143
            },
            {
              "sourceClauseId": "s1c0",
              "matchedClauseId": "s1c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.122
            },
            {
              "sourceClauseId": "s1c1",
              "matchedClauseId": "s2c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.041
            },
            {
              "sourceClauseId": "s2c0",
              "matchedClauseId": "s3c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.8,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.667,
              "globalBagScore": 0.08
            },
            {
              "sourceClauseId": "s3c0",
              "matchedClauseId": "s4c0+s5c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.5,
              "globalBagScore": 0.058
            },
            {
              "sourceClauseId": "s4c0",
              "matchedClauseId": "s6c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.041
            },
            {
              "sourceClauseId": "s5c0",
              "matchedClauseId": "s7c0+s8c0",
              "propositionCoverage": 0.9,
              "actorCoverage": 1,
              "actionCoverage": 0.81,
              "objectCoverage": 1,
              "polarityMismatch": 1,
              "tenseMismatch": 0,
              "bagScore": 0.714,
              "globalBagScore": 0.1
            },
            {
              "sourceClauseId": "s6c0",
              "matchedClauseId": "s9c0+s10c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.455,
              "globalBagScore": 0.1
            },
            {
              "sourceClauseId": "s7c0",
              "matchedClauseId": "s12c0+s13c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.875,
              "globalBagScore": 0.143
            }
          ],
          "sourceClauseCount": 9,
          "outputClauseCount": 15
        },
        "protectedAnchorAudit": {
          "totalAnchors": 2,
          "resolvedAnchors": 2,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 14,
            "clauseCount": 15,
            "literalSpans": [
              {
                "value": "4:05 PM",
                "placeholder": "__PROTLIT_A__"
              },
              {
                "value": "Q3",
                "placeholder": "__PROTLIT_B__"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "The finance committee met at 4:05 PM to check the bridge budget after central administration extended the hiring freeze thru Q3",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "The finance committee met at 4:05 PM to check the bridge budget after central administration extended the hiring freeze thru Q3",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "check",
                  "actor": "The finance",
                  "action": "check",
                  "object": "bridge budget after central administration",
                  "modifiers": [
                    "central"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "The immediate effect is that the student-help coordinator line remains unfunded for another twelve wks",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "The immediate effect is that the student-help coordinator line remains unfunded for another twelve wks",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "is",
                  "actor": "The immediate",
                  "action": "is",
                  "object": "student help coordinator line remains",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "Even though the underlying service demand has not eased",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "Even",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "even",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s2c1",
                  "text": "the underlying service demand has not eased",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "has",
                  "actor": "the underlying",
                  "action": "has",
                  "object": "eased",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "Members agreed that the program can absorb a temp delay in furniture and print costs, but not a full quarter w/ o intake coverage",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "Members agreed that the program can absorb a temp delay in furniture and print costs, but not a full quarter w/ o intake coverage",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "can",
                  "actor": "that",
                  "action": "can",
                  "object": "absorb temp delay furniture print",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "Three short-term options were discussed",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "Three short-term options were discussed",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "were",
                  "actor": "",
                  "action": "were",
                  "object": "discussed",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "Reclassify one vacant analyst line for bridge staffing, reduce evening service hrs, or draw against restricted reserves pending dean approval",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "Reclassify one vacant analyst line for bridge staffing, reduce evening service hrs, or draw against restricted reserves pending dean approval",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "reclassify",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "approval"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s6",
              "raw": "No option was adopted in session",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s6c0",
                  "text": "No option was adopted in session",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "was",
                  "actor": "",
                  "action": "was",
                  "object": "adopted session",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s7",
              "raw": "What did help was the frame",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s7c0",
                  "text": "What did help was the frame",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "did",
                  "actor": "the frame",
                  "action": "did",
                  "object": "help frame",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s8",
              "raw": "This is not a generic belt-tightening exercise",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s8c0",
                  "text": "This is not a generic belt-tightening exercise",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "is",
                  "actor": "This",
                  "action": "is",
                  "object": "generic belt tightening exercise",
                  "modifiers": [
                    "generic"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s9",
              "raw": "Its a staffing exposure problem w/ public-facing consequences",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s9c0",
                  "text": "Its a staffing exposure problem w/ public-facing consequences",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "its",
                  "actor": "a staffing",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "public"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s10",
              "raw": "The next memo needs to say that w/o overstating certainty",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s10c0",
                  "text": "The next memo needs to say that w/o overstating certainty",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "needs",
                  "actor": "The next",
                  "action": "needs",
                  "object": "say w o overstating certainty",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s11",
              "raw": "Action items",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s11c0",
                  "text": "Action items",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "action",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s12",
              "raw": "Revised table by Thursday, reserve-rule clarification from finance",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s12c0",
                  "text": "Revised table by Thursday, reserve-rule clarification from finance",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "revised",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "table"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s13",
              "raw": "A staffing scenario note that distinguishes pause from actual service reduction.",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s13c0",
                  "text": "A staffing scenario note that distinguishes pause from actual service reduction",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "pause",
                  "actor": "A staffing",
                  "action": "pause",
                  "object": "from actual service reduction",
                  "modifiers": [
                    "actual"
                  ],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "realizationSummary": {
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "connector-stance",
            "lexical-register",
            "content-word-complexity",
            "directness",
            "abbreviation-posture",
            "fragment-posture",
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "help",
              "from": "support",
              "to": "help",
              "kind": "lexeme"
            },
            {
              "family": "check",
              "from": "review",
              "to": "check",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.42,
          "donorProgress": {
            "eligible": true,
            "sourceDonorDistance": 3.863,
            "outputDonorDistance": 3.117,
            "donorImprovement": 0.746,
            "donorImprovementRatio": 0.193,
            "sourceOutputLexicalOverlap": 0.859
          },
          "realizationNotes": [
            "3 lexical family swaps landed.",
            "Register shift surfaced through lexical-register, content-word-complexity, directness, abbreviation-posture, orthography-posture, fragment-posture, surface-marker-posture.",
            "Semantic risk is elevated; review the realized output before relying on it."
          ],
          "rescuePasses": [
            "td613-aperture-warning"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "generatorVersion": "v2",
        "sourceClass": "procedural-record",
        "candidateLedger": [
          {
            "id": "base",
            "envelopeId": "spark",
            "status": "selected",
            "score": 0.876,
            "rewriteStrength": 1,
            "targetFit": 0.6126,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "The finance committee met at 4:05 PM to review the bridge budget after central administration extended the hiring freeze thru Q3. The immediate effect is that t"
          },
          {
            "id": "amplified",
            "envelopeId": "spark",
            "status": "eligible",
            "score": 0.8612,
            "rewriteStrength": 1,
            "targetFit": 0.5662,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "The finance committee met at 4:05 PM to review the bridge budget after central administration extended the hiring freeze thru Q3. The immediate effect is that t"
          },
          {
            "id": "contrast",
            "envelopeId": "spark",
            "status": "eligible",
            "score": 0.8591,
            "rewriteStrength": 1,
            "targetFit": 0.5597,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "The finance committee met at 4:05 PM to review the bridge budget after central administration extended the hiring freeze thru Q3. The immediate effect is that t"
          },
          {
            "id": "conservative",
            "envelopeId": "spark",
            "status": "eligible",
            "score": 0.8633,
            "rewriteStrength": 1,
            "targetFit": 0.5729,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "The finance committee met at 4:05 PM to review the bridge budget after central administration extended the hiring freeze thru Q3. The immediate effect is that t"
          }
        ],
        "generationDocket": {
          "status": "landed",
          "holdClass": null,
          "headline": "Generator V2 landed a registered rewrite.",
          "reasons": [],
          "candidateCount": 4,
          "winningCandidateId": "base"
        },
        "winningCandidateId": "base"
      },
      "semanticContract": {
        "transferClass": "structural",
        "realizationTier": "lexical-structural",
        "changedDimensions": [
          "abbreviation-posture",
          "connector-stance",
          "content-word-complexity",
          "directness",
          "fragment-posture",
          "lexical-register",
          "punctuation-shape",
          "sentence-count",
          "sentence-mean"
        ],
        "lexemeSwapFamilies": [
          "check",
          "help"
        ],
        "relationInventory": [
          "additive:3",
          "causal:0",
          "clarifying:0",
          "contrastive:2",
          "resumptive:0",
          "temporal:1"
        ],
        "structuralOperations": [
          "baseline-split"
        ],
        "lexicalOperations": [
          "baseline-voice-realization",
          "connector-stance-lexicon"
        ],
        "connectorStrategy": "additive",
        "contractionStrategy": "hold",
        "propositionCoverage": 0.989,
        "actorCoverage": 1,
        "actionCoverage": 0.979,
        "objectCoverage": 0.922,
        "polarityMismatches": 1,
        "tenseMismatches": 0,
        "protectedAnchorIntegrity": 1
      }
    },
    "committee-budget-rushed-mobile-under-formal-record": {
      "id": "committee-budget-rushed-mobile-under-formal-record",
      "category": "retrieval-same-fact",
      "strength": 0.88,
      "sourceText": "freeze runs thru q3. means coord line stays empty 12 more wks unless we bridge it. room was basically: cut print/furniture if needed, dont fake that intake can run w no staffing hit. 3 options still analyst line / evening hrs / reserves w dean ok. revised table thurs after finance answers reserve rule",
      "donorText": "The finance committee met at 4:05 PM to review the bridge budget after central administration extended the hiring freeze through Q3. The immediate effect is that the student-support coordinator line remains unfunded for another twelve weeks, even though the underlying service demand has not eased. Members agreed that the program can absorb a temporary delay in furniture and print costs, but not a full quarter without intake coverage. Three short-term options were discussed: reclassify one vacant analyst line for bridge staffing, reduce evening service hours, or draw against restricted reserves pending dean approval. No option was adopted in session. What did resolve was the frame: this is not a generic belt-tightening exercise. It is a staffing exposure problem with public-facing consequences, and the next memo needs to say that without overstating certainty. Action items: revised table by Thursday, reserve-rule clarification from finance, and a staffing scenario note that distinguishes pause from actual service reduction.",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.88,
        "profile": {
          "avgSentenceLength": 20,
          "sentenceCount": 8,
          "contractionDensity": 0,
          "punctuationDensity": 0.15,
          "contentWordComplexity": 0.484,
          "modifierDensity": 0.052,
          "directness": 0,
          "abstractionPosture": 0.5
        }
      },
      "retrievalTrace": {
        "sourceText": "freeze runs thru q3. means coord line stays empty 12 more wks unless we bridge it. room was basically: cut print/furniture if needed, dont fake that intake can run w no staffing hit. 3 options still analyst line / evening hrs / reserves w dean ok. revised table thurs after finance answers reserve rule",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.88,
          "profile": {
            "avgSentenceLength": 19.8,
            "sentenceCount": 5,
            "contractionDensity": 0,
            "punctuationDensity": 0.149,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.429,
            "modifierDensity": 0.055,
            "hedgeDensity": 0,
            "directness": 0,
            "abstractionPosture": 0.5,
            "latinatePreference": 0.065,
            "recurrencePressure": 0.172
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 5,
            "clauseCount": 7,
            "literalSpans": [
              {
                "value": "q3",
                "placeholder": "__PROTLIT_A__"
              },
              {
                "value": "12",
                "placeholder": "__PROTLIT_B__"
              },
              {
                "value": "3",
                "placeholder": "__PROTLIT_C__"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "freeze runs thru __PROTLIT_A__",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "freeze runs thru __PROTLIT_A__",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "freeze",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "means coord line stays empty __PROTLIT_B__ more wks unless we bridge it",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "means coord line stays empty __PROTLIT_B__ more wks",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "means",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s1c1",
                  "text": "we bridge it",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "bridge",
                  "actor": "we",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "room was basically: cut print/furniture if needed, dont fake that intake can run w no staffing hit",
              "rhetoricalRole": "resumptive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "room was basically: cut print/furniture",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "was",
                  "actor": "",
                  "action": "was",
                  "object": "basically cut print furniture",
                  "modifiers": [
                    "basically"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s2c1",
                  "text": "needed, dont fake that intake can run w no staffing hit",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "needed",
                  "actor": "that",
                  "action": "needed",
                  "object": "dont fake intake run w",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "__PROTLIT_C__ options still analyst line / evening hrs / reserves w dean ok",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "__PROTLIT_C__ options still analyst line / evening hrs / reserves w dean ok",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "protlit",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "revised table thurs after finance answers reserve rule",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "revised table thurs after finance answers reserve rule",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "revised",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "table"
                  ],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "opportunityProfile": {
          "sentenceSplit": 1,
          "sentenceMerge": 4,
          "contraction": 0,
          "connector": 2,
          "lineBreak": 4,
          "abbreviation": 1,
          "orthography": 5,
          "fragment": 0,
          "conversational": 0,
          "additive": 0,
          "contrastive": 1,
          "causal": 0,
          "temporal": 1,
          "clarifying": 0,
          "resumptive": 2
        },
        "planSummary": {
          "transferMode": "expand",
          "structuralOperationsSelected": [
            "merge-pairs",
            "clause-texture"
          ],
          "lexicalRegisterOperationsSelected": [],
          "connectorStrategy": "resumptive",
          "contractionStrategy": "hold",
          "relationInventory": {
            "additive": 0,
            "contrastive": 1,
            "causal": 0,
            "temporal": 1,
            "clarifying": 0,
            "resumptive": 2
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": 9.200000000000001
          },
          "discourseGoals": {
            "contractionDelta": 0,
            "hedgeDelta": 0
          },
          "registerGoals": {
            "contentWordComplexityDelta": 0.177,
            "modifierDensityDelta": -0.010000000000000002,
            "directnessDelta": 0,
            "abstractionDelta": 0,
            "latinateDelta": 0.043000000000000003,
            "registerMode": "plain"
          },
          "operationBudget": {
            "splitSentence": 0,
            "mergeSentence": 8,
            "swapConnector": 2,
            "applyHedge": 2,
            "realizeLexicon": 5
          }
        },
        "candidateSummary": {
          "selected": {
            "spec": "ir-beam-search",
            "score": 394.738,
            "passesApplied": [
              "merge-pairs",
              "clause-texture"
            ],
            "rescuePasses": [],
            "changedDimensions": [
              "sentence-mean",
              "sentence-count",
              "sentence-spread",
              "connector-stance",
              "lexical-register",
              "abbreviation-posture",
              "orthography-posture",
              "surface-marker-posture",
              "punctuation-shape"
            ],
            "qualityGatePassed": true,
            "notes": []
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 394.738,
              "passesApplied": [
                "merge-pairs",
                "clause-texture"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "abbreviation-posture",
                "orthography-posture",
                "surface-marker-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "mixed-structural",
              "score": 274.112,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "baseline-function-word",
                "connector-stance-lexicon",
                "punctuation-finish",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "orthography-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "merge-heavy",
              "score": 274.112,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "baseline-function-word",
                "connector-stance-lexicon",
                "punctuation-finish",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "orthography-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "connector-stance-heavy",
              "score": 274.112,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "baseline-function-word",
                "connector-stance-lexicon",
                "punctuation-finish",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "orthography-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "lexical-register-heavy",
              "score": 271.112,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "baseline-function-word",
                "connector-stance-lexicon"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "orthography-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            }
          ]
        },
        "finalRealization": {
          "text": "Freeze runs through q3, and means coord line stays empty 12 more weeks unless we bridge it. Room was basically: cut print/furniture if needed, do not fake that intake can run w no staffing hit, though 3 options still analyst line; evening hours; reserves w dean okay. Revised table thurs after finance answers reserve rule",
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "sentence-spread",
            "connector-stance",
            "lexical-register",
            "abbreviation-posture",
            "orthography-posture",
            "surface-marker-posture",
            "punctuation-shape"
          ],
          "lexemeSwaps": [],
          "semanticRisk": 0.3,
          "donorProgress": {
            "eligible": true,
            "sourceDonorDistance": 3.863,
            "outputDonorDistance": 1.924,
            "donorImprovement": 1.939,
            "donorImprovementRatio": 0.502,
            "sourceOutputLexicalOverlap": 0.78
          },
          "rescuePasses": [
            "td613-aperture-warning"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "semanticAudit": {
          "propositionCoverage": 1,
          "actorCoverage": 1,
          "actionCoverage": 1,
          "objectCoverage": 0.936,
          "polarityMismatches": 1,
          "tenseMismatches": 0,
          "protectedAnchorIntegrity": 1,
          "clauseAudits": [
            {
              "sourceClauseId": "s0c0",
              "matchedClauseId": "s0c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.077
            },
            {
              "sourceClauseId": "s1c0",
              "matchedClauseId": "s0c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0,
              "globalBagScore": 0
            },
            {
              "sourceClauseId": "s1c1",
              "matchedClauseId": "s0c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.077
            },
            {
              "sourceClauseId": "s2c0",
              "matchedClauseId": "s0c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0,
              "globalBagScore": 0.063
            },
            {
              "sourceClauseId": "s2c1",
              "matchedClauseId": "s0c1+s1c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.8,
              "polarityMismatch": 1,
              "tenseMismatch": 0,
              "bagScore": 0.556,
              "globalBagScore": 0.357
            },
            {
              "sourceClauseId": "s3c0",
              "matchedClauseId": "s0c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0,
              "globalBagScore": 0
            },
            {
              "sourceClauseId": "s4c0",
              "matchedClauseId": "s2c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.154
            }
          ],
          "sourceClauseCount": 7,
          "outputClauseCount": 6
        },
        "protectedAnchorAudit": {
          "totalAnchors": 3,
          "resolvedAnchors": 3,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 3,
            "clauseCount": 6,
            "literalSpans": [
              {
                "value": "q3",
                "placeholder": "__PROTLIT_A__"
              },
              {
                "value": "12",
                "placeholder": "__PROTLIT_B__"
              },
              {
                "value": "3",
                "placeholder": "__PROTLIT_C__"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Freeze runs through q3, and means coord line stays empty 12 more weeks unless we bridge it",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Freeze runs through q3, and means coord line stays empty 12 more weeks",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "freeze",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s0c1",
                  "text": "we bridge it",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "bridge",
                  "actor": "we",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "Room was basically: cut print/furniture if needed, do not fake that intake can run w no staffing hit, though 3 options still analyst line; evening hours; reserves w dean okay",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "Room was basically: cut print/furniture if needed, do not fake that intake can run w no staffing hit, though 3 options still analyst line",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "needed",
                  "actor": "that",
                  "action": "needed",
                  "object": "fake intake run w no",
                  "modifiers": [
                    "basically"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s1c1",
                  "text": "evening hours",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "evening",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s1c2",
                  "text": "reserves w dean okay",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "reserves",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "Revised table thurs after finance answers reserve rule",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "Revised table thurs after finance answers reserve rule",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "revised",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "table"
                  ],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "realizationSummary": {
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "sentence-spread",
            "connector-stance",
            "lexical-register",
            "abbreviation-posture",
            "orthography-posture",
            "surface-marker-posture",
            "punctuation-shape"
          ],
          "lexemeSwaps": [],
          "semanticRisk": 0.3,
          "donorProgress": {
            "eligible": true,
            "sourceDonorDistance": 3.863,
            "outputDonorDistance": 1.924,
            "donorImprovement": 1.939,
            "donorImprovementRatio": 0.502,
            "sourceOutputLexicalOverlap": 0.78
          },
          "realizationNotes": [
            "Register shift surfaced through lexical-register, abbreviation-posture, orthography-posture, surface-marker-posture.",
            "Semantic risk is elevated; review the realized output before relying on it."
          ],
          "rescuePasses": [
            "td613-aperture-warning"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "generatorVersion": "v2",
        "sourceClass": "narrative-scene",
        "candidateLedger": [
          {
            "id": "base",
            "envelopeId": "matron",
            "status": "selected",
            "score": 0.829,
            "rewriteStrength": 1,
            "targetFit": 0.4656,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Freeze runs through q3, and means coord line stays empty 12 more weeks unless we bridge it. Room was basically: cut print/furniture if needed, do not fake that "
          },
          {
            "id": "amplified",
            "envelopeId": "matron",
            "status": "eligible",
            "score": 0.7763,
            "rewriteStrength": 1,
            "targetFit": 0.3009,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Freeze runs through q3, but means coord line stays empty 12 more weeks unless we bridge it, though room was basically: cut print/furniture if needed, do not fak"
          },
          {
            "id": "contrast",
            "envelopeId": "matron",
            "status": "eligible",
            "score": 0.7752,
            "rewriteStrength": 1,
            "targetFit": 0.2976,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Freeze runs through q3, but means coord line stays empty 12 more weeks unless we bridge it, though room was basically: cut print/furniture if needed, do not fak"
          },
          {
            "id": "conservative",
            "envelopeId": "matron",
            "status": "eligible",
            "score": 0.7775,
            "rewriteStrength": 1,
            "targetFit": 0.3047,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Freeze runs through q3, but means coord line stays empty 12 more weeks unless we bridge it, though room was basically: cut print/furniture if needed, do not fak"
          }
        ],
        "generationDocket": {
          "status": "landed",
          "holdClass": null,
          "headline": "Generator V2 landed a registered rewrite.",
          "reasons": [],
          "candidateCount": 4,
          "winningCandidateId": "base"
        },
        "winningCandidateId": "base"
      },
      "semanticContract": {
        "transferClass": "structural",
        "realizationTier": "lexical-structural",
        "changedDimensions": [
          "abbreviation-posture",
          "connector-stance",
          "lexical-register",
          "orthography-posture",
          "punctuation-shape",
          "sentence-count",
          "sentence-mean",
          "sentence-spread",
          "surface-marker-posture"
        ],
        "lexemeSwapFamilies": [],
        "relationInventory": [
          "additive:0",
          "causal:0",
          "clarifying:0",
          "contrastive:1",
          "resumptive:2",
          "temporal:1"
        ],
        "structuralOperations": [
          "clause-texture",
          "merge-pairs"
        ],
        "lexicalOperations": [],
        "connectorStrategy": "resumptive",
        "contractionStrategy": "hold",
        "propositionCoverage": 1,
        "actorCoverage": 1,
        "actionCoverage": 1,
        "objectCoverage": 0.936,
        "polarityMismatches": 1,
        "tenseMismatches": 0,
        "protectedAnchorIntegrity": 1
      }
    },
    "archive-grant-formal-record-under-rushed-mobile": {
      "id": "archive-grant-formal-record-under-rushed-mobile",
      "category": "retrieval-same-fact",
      "strength": 0.88,
      "sourceText": "The proposed archive grant has three linked deliverables rather than one large undifferentiated access claim. First, the team will complete a shared cataloging protocol for neighborhood collections now described with inconsistent local vocabularies. Second, six community stewards will be trained to review descriptive language before records are published or exhibited. Third, a portable exhibition kit will be built for circulation through branch libraries, school sites, and tenant meetings. The scheduling risk is not the catalog build itself, but the interval between description and community review. If that interval stretches, the project drifts back toward extractive efficiency rather than reciprocal stewardship. Planning assumptions therefore include a two-week review buffer in each cycle, a modest translation budget, and a rule that no descriptive template is treated as final before local review has actually occurred.",
      "donorText": "grant isnt just digitize + pray. its shared catalog protocol + 6 steward reviewers + portable exhibit kit. main risk is if description outruns local review and we start calling extraction access. pls keep the 2 wk review buffer + translation line in budget",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.88,
        "profile": {
          "avgSentenceLength": 10,
          "sentenceCount": 4,
          "contractionDensity": 0,
          "punctuationDensity": 0.075,
          "contentWordComplexity": 0.385,
          "modifierDensity": 0.061,
          "directness": 0.18,
          "abstractionPosture": 0
        }
      },
      "retrievalTrace": {
        "sourceText": "The proposed archive grant has three linked deliverables rather than one large undifferentiated access claim. First, the team will complete a shared cataloging protocol for neighborhood collections now described with inconsistent local vocabularies. Second, six community stewards will be trained to review descriptive language before records are published or exhibited. Third, a portable exhibition kit will be built for circulation through branch libraries, school sites, and tenant meetings. The scheduling risk is not the catalog build itself, but the interval between description and community review. If that interval stretches, the project drifts back toward extractive efficiency rather than reciprocal stewardship. Planning assumptions therefore include a two-week review buffer in each cycle, a modest translation budget, and a rule that no descriptive template is treated as final before local review has actually occurred.",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.88,
          "profile": {
            "avgSentenceLength": 10.19,
            "sentenceCount": 7,
            "contractionDensity": 0,
            "punctuationDensity": 0.076,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.434,
            "modifierDensity": 0.074,
            "hedgeDensity": 0.025,
            "directness": 0.137,
            "abstractionPosture": 0.667,
            "latinatePreference": 0.12,
            "recurrencePressure": 0.077
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 7,
            "clauseCount": 8,
            "literalSpans": []
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "The proposed archive grant has three linked deliverables rather than one large undifferentiated access claim",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "The proposed archive grant has three linked deliverables rather than one large undifferentiated access claim",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "has",
                  "actor": "The proposed",
                  "action": "has",
                  "object": "three linked deliverables than one",
                  "modifiers": [
                    "archive"
                  ],
                  "hedgeMarkers": [
                    "uncertainty",
                    "intensification"
                  ]
                }
              ]
            },
            {
              "id": "s1",
              "raw": "First, the team will complete a shared cataloging protocol for neighborhood collections now described with inconsistent local vocabularies",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "First, the team will complete a shared cataloging protocol for neighborhood collections now described with inconsistent local vocabularies",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "future-modal",
                  "propositionHead": "will",
                  "actor": "the team",
                  "action": "will",
                  "object": "complete shared cataloging protocol neighborhood",
                  "modifiers": [
                    "local"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "Second, six community stewards will be trained to review descriptive language before records are published or exhibited",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "Second, six community stewards will be trained to review descriptive language before records are published or exhibited",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "future-modal",
                  "propositionHead": "review",
                  "actor": "",
                  "action": "review",
                  "object": "descriptive language before records published",
                  "modifiers": [
                    "descriptive"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "Third, a portable exhibition kit will be built for circulation through branch libraries, school sites, and tenant meetings",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "Third, a portable exhibition kit will be built for circulation through branch libraries, school sites, and tenant meetings",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "future-modal",
                  "propositionHead": "will",
                  "actor": "a portable",
                  "action": "will",
                  "object": "built circulation through branch libraries",
                  "modifiers": [
                    "portable"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "The scheduling risk is not the catalog build itself, but the interval between description and community review",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "The scheduling risk is not the catalog build itself, but the interval between description and community review",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "review",
                  "actor": "The scheduling",
                  "action": "review",
                  "object": "",
                  "modifiers": [
                    "interval"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "If that interval stretches, the project drifts back toward extractive efficiency rather than reciprocal stewardship",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "If that interval stretches, the project drifts back toward extractive efficiency rather than reciprocal stewardship",
                  "relationToPrev": "start",
                  "clauseType": "subordinate",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "interval",
                  "actor": "that",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "interval",
                    "extractive",
                    "reciprocal"
                  ],
                  "hedgeMarkers": [
                    "uncertainty",
                    "intensification"
                  ]
                }
              ]
            },
            {
              "id": "s6",
              "raw": "Planning assumptions therefore include a two-week review buffer in each cycle, a modest translation budget, and a rule that no descriptive template is treated as final before local review has actually occurred.",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s6c0",
                  "text": "Planning assumptions therefore include a two-week review buffer in each cycle, a modest translation budget, and a rule that no descriptive template is treated",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "review",
                  "actor": "a two",
                  "action": "review",
                  "object": "buffer each cycle modest translation",
                  "modifiers": [
                    "descriptive"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s6c1",
                  "text": "final before local review has actually occurred",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "review",
                  "actor": "",
                  "action": "review",
                  "object": "occurred",
                  "modifiers": [
                    "final",
                    "local",
                    "actually"
                  ],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "opportunityProfile": {
          "sentenceSplit": 0,
          "sentenceMerge": 6,
          "contraction": 0,
          "connector": 5,
          "lineBreak": 6,
          "abbreviation": 0,
          "orthography": 0,
          "fragment": 0,
          "conversational": 0,
          "additive": 3,
          "contrastive": 1,
          "causal": 1,
          "temporal": 2,
          "clarifying": 0,
          "resumptive": 0
        },
        "planSummary": {
          "transferMode": "compress",
          "structuralOperationsSelected": [
            "baseline-split"
          ],
          "lexicalRegisterOperationsSelected": [
            "baseline-voice-realization",
            "connector-stance-lexicon"
          ],
          "connectorStrategy": "additive",
          "contractionStrategy": "hold",
          "relationInventory": {
            "additive": 3,
            "contrastive": 1,
            "causal": 1,
            "temporal": 2,
            "clarifying": 0,
            "resumptive": 0
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": -8.81
          },
          "discourseGoals": {
            "contractionDelta": 0,
            "hedgeDelta": 0.0020000000000000018
          },
          "registerGoals": {
            "contentWordComplexityDelta": -0.15399999999999997,
            "modifierDensityDelta": -0.04100000000000001,
            "directnessDelta": 0.137,
            "abstractionDelta": 0,
            "latinateDelta": 0.0049999999999999906,
            "registerMode": "compressed"
          },
          "operationBudget": {
            "splitSentence": 16,
            "mergeSentence": 0,
            "swapConnector": 2,
            "applyHedge": 0,
            "realizeLexicon": 5
          }
        },
        "candidateSummary": {
          "selected": {
            "spec": "mixed-structural",
            "score": 438.83,
            "passesApplied": [
              "baseline-split",
              "baseline-voice-realization",
              "connector-stance-lexicon"
            ],
            "rescuePasses": [],
            "changedDimensions": [
              "sentence-mean",
              "sentence-count",
              "sentence-spread",
              "connector-stance",
              "lexical-register",
              "directness",
              "abstraction-posture",
              "abbreviation-posture",
              "orthography-posture",
              "fragment-posture",
              "punctuation-shape"
            ],
            "qualityGatePassed": true,
            "notes": []
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 436.077,
              "passesApplied": [
                "split-rules",
                "phrase-texture"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "directness",
                "abstraction-posture",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "mixed-structural",
              "score": 438.83,
              "passesApplied": [
                "baseline-split",
                "baseline-voice-realization",
                "connector-stance-lexicon"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "directness",
                "abstraction-posture",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "split-heavy",
              "score": 438.83,
              "passesApplied": [
                "baseline-split",
                "baseline-voice-realization",
                "connector-stance-lexicon"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "directness",
                "abstraction-posture",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "connector-stance-heavy",
              "score": 438.83,
              "passesApplied": [
                "baseline-split",
                "baseline-voice-realization",
                "connector-stance-lexicon"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "directness",
                "abstraction-posture",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "lexical-register-heavy",
              "score": 438.83,
              "passesApplied": [
                "baseline-split",
                "baseline-voice-realization",
                "connector-stance-lexicon"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "directness",
                "abstraction-posture",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            }
          ]
        },
        "finalRealization": {
          "text": "The proposed archive grant has three linked deliverables rather than one large undifferentiated access claim. First. The team will complete a shared cataloging protocol for neighborhood collections now described w/ inconsistent local vocabularies. Second, six community stewards will be trained to check descriptive language before records are published or exhibited. Third. A portable exhibition kit will be built for circulation thru branch libraries, school sites.  Tenant meetings. The booking risk is not the catalog build itself, but the interval between description and community check, if that interval stretches. The project drifts back toward extractive efficiency rather than reciprocal stewardship. Planning assumptions therefore include a two-wk review buffer in each cycle. A modest translation budget.  A rule that no descriptive template is treated as final before local review has actually occurred.",
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "sentence-spread",
            "connector-stance",
            "lexical-register",
            "directness",
            "abstraction-posture",
            "abbreviation-posture",
            "fragment-posture",
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "book",
              "from": "scheduling",
              "to": "booking",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.12,
          "donorProgress": {
            "eligible": true,
            "sourceDonorDistance": 5.273,
            "outputDonorDistance": 3.621,
            "donorImprovement": 1.652,
            "donorImprovementRatio": 0.313,
            "sourceOutputLexicalOverlap": 0.918
          },
          "rescuePasses": [
            "td613-aperture-warning"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "semanticAudit": {
          "propositionCoverage": 1,
          "actorCoverage": 1,
          "actionCoverage": 1,
          "objectCoverage": 0.95,
          "polarityMismatches": 1,
          "tenseMismatches": 1,
          "protectedAnchorIntegrity": 1,
          "clauseAudits": [
            {
              "sourceClauseId": "s0c0",
              "matchedClauseId": "s0c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.163
            },
            {
              "sourceClauseId": "s1c0",
              "matchedClauseId": "s2c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.163
            },
            {
              "sourceClauseId": "s2c0",
              "matchedClauseId": "s3c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.14
            },
            {
              "sourceClauseId": "s3c0",
              "matchedClauseId": "s5c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.8,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.714,
              "globalBagScore": 0.114
            },
            {
              "sourceClauseId": "s4c0",
              "matchedClauseId": "s7c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.07
            },
            {
              "sourceClauseId": "s5c0",
              "matchedClauseId": "s7c1+s8c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.75,
              "globalBagScore": 0.07
            },
            {
              "sourceClauseId": "s6c0",
              "matchedClauseId": "s9c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.8,
              "polarityMismatch": 1,
              "tenseMismatch": 1,
              "bagScore": 0.625,
              "globalBagScore": 0.159
            },
            {
              "sourceClauseId": "s6c1",
              "matchedClauseId": "s11c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.093
            }
          ],
          "sourceClauseCount": 8,
          "outputClauseCount": 14
        },
        "protectedAnchorAudit": {
          "totalAnchors": 0,
          "resolvedAnchors": 0,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 12,
            "clauseCount": 14,
            "literalSpans": []
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "The proposed archive grant has three linked deliverables rather than one large undifferentiated access claim",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "The proposed archive grant has three linked deliverables rather than one large undifferentiated access claim",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "has",
                  "actor": "The proposed",
                  "action": "has",
                  "object": "three linked deliverables than one",
                  "modifiers": [
                    "archive"
                  ],
                  "hedgeMarkers": [
                    "uncertainty",
                    "intensification"
                  ]
                }
              ]
            },
            {
              "id": "s1",
              "raw": "First",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "First",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "first",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "The team will complete a shared cataloging protocol for neighborhood collections now described w/ inconsistent local vocabularies",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "The team will complete a shared cataloging protocol for neighborhood collections now described w/ inconsistent local vocabularies",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "future-modal",
                  "propositionHead": "will",
                  "actor": "The team",
                  "action": "will",
                  "object": "complete shared cataloging protocol neighborhood",
                  "modifiers": [
                    "local"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "Second, six community stewards will be trained to check descriptive language before records are published or exhibited",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "Second, six community stewards will be trained to check descriptive language before records are published or exhibited",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "future-modal",
                  "propositionHead": "check",
                  "actor": "",
                  "action": "check",
                  "object": "descriptive language before records published",
                  "modifiers": [
                    "descriptive"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "Third",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "Third",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "third",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "A portable exhibition kit will be built for circulation thru branch libraries, school sites",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "A portable exhibition kit will be built for circulation thru branch libraries, school sites",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "future-modal",
                  "propositionHead": "will",
                  "actor": "A portable",
                  "action": "will",
                  "object": "built circulation thru branch libraries",
                  "modifiers": [
                    "portable"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s6",
              "raw": "Tenant meetings",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s6c0",
                  "text": "Tenant meetings",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "tenant",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s7",
              "raw": "The booking risk is not the catalog build itself, but the interval between description and community check, if that interval stretches",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s7c0",
                  "text": "The booking risk is not the catalog build itself, but the interval between description and community check",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "check",
                  "actor": "The booking",
                  "action": "check",
                  "object": "",
                  "modifiers": [
                    "interval"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s7c1",
                  "text": "that interval stretches",
                  "relationToPrev": "additive",
                  "clauseType": "relative",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "interval",
                  "actor": "that",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "interval"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s8",
              "raw": "The project drifts back toward extractive efficiency rather than reciprocal stewardship",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s8c0",
                  "text": "The project drifts back toward extractive efficiency rather than reciprocal stewardship",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "project",
                  "actor": "The project",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "extractive",
                    "reciprocal"
                  ],
                  "hedgeMarkers": [
                    "uncertainty",
                    "intensification"
                  ]
                }
              ]
            },
            {
              "id": "s9",
              "raw": "Planning assumptions therefore include a two-wk review buffer in each cycle",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s9c0",
                  "text": "Planning assumptions therefore include a two-wk review buffer in each cycle",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "review",
                  "actor": "a two",
                  "action": "review",
                  "object": "buffer each cycle",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s10",
              "raw": "A modest translation budget",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s10c0",
                  "text": "A modest translation budget",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "modest",
                  "actor": "A modest",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s11",
              "raw": "A rule that no descriptive template is treated as final before local review has actually occurred.",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s11c0",
                  "text": "A rule that no descriptive template is treated",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "is",
                  "actor": "A rule",
                  "action": "is",
                  "object": "treated",
                  "modifiers": [
                    "descriptive"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s11c1",
                  "text": "final before local review has actually occurred",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "review",
                  "actor": "",
                  "action": "review",
                  "object": "occurred",
                  "modifiers": [
                    "final",
                    "local",
                    "actually"
                  ],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "realizationSummary": {
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "sentence-spread",
            "connector-stance",
            "lexical-register",
            "directness",
            "abstraction-posture",
            "abbreviation-posture",
            "fragment-posture",
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "book",
              "from": "scheduling",
              "to": "booking",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.12,
          "donorProgress": {
            "eligible": true,
            "sourceDonorDistance": 5.273,
            "outputDonorDistance": 3.621,
            "donorImprovement": 1.652,
            "donorImprovementRatio": 0.313,
            "sourceOutputLexicalOverlap": 0.918
          },
          "realizationNotes": [
            "1 lexical family swap landed.",
            "Register shift surfaced through lexical-register, directness, abstraction-posture, abbreviation-posture, orthography-posture, fragment-posture."
          ],
          "rescuePasses": [
            "td613-aperture-warning"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "generatorVersion": "v2",
        "sourceClass": "formal-correspondence",
        "candidateLedger": [
          {
            "id": "base",
            "envelopeId": "spark",
            "status": "selected",
            "score": 0.7944,
            "rewriteStrength": 1,
            "targetFit": 0.3576,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "The proposed archive grant has three linked deliverables rather than one large undifferentiated access claim. First. The team will complete a shared cataloging "
          },
          {
            "id": "amplified",
            "envelopeId": "spark",
            "status": "eligible",
            "score": 0.7697,
            "rewriteStrength": 1,
            "targetFit": 0.2803,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "The proposed archive grant has three linked deliverables rather than one large undifferentiated access claim. First. The team will complete a shared cataloging "
          },
          {
            "id": "contrast",
            "envelopeId": "spark",
            "status": "eligible",
            "score": 0.7653,
            "rewriteStrength": 1,
            "targetFit": 0.2665,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "The proposed archive grant has three linked deliverables rather than one large undifferentiated access claim. First. The team will complete a shared cataloging "
          },
          {
            "id": "conservative",
            "envelopeId": "spark",
            "status": "eligible",
            "score": 0.7752,
            "rewriteStrength": 1,
            "targetFit": 0.2974,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "The proposed archive grant has three linked deliverables rather than one large undifferentiated access claim. First. The team will complete a shared cataloging "
          }
        ],
        "generationDocket": {
          "status": "landed",
          "holdClass": null,
          "headline": "Generator V2 landed a registered rewrite.",
          "reasons": [],
          "candidateCount": 4,
          "winningCandidateId": "base"
        },
        "winningCandidateId": "base"
      },
      "semanticContract": {
        "transferClass": "structural",
        "realizationTier": "lexical-structural",
        "changedDimensions": [
          "abbreviation-posture",
          "abstraction-posture",
          "connector-stance",
          "directness",
          "fragment-posture",
          "lexical-register",
          "punctuation-shape",
          "sentence-count",
          "sentence-mean",
          "sentence-spread"
        ],
        "lexemeSwapFamilies": [
          "book"
        ],
        "relationInventory": [
          "additive:3",
          "causal:1",
          "clarifying:0",
          "contrastive:1",
          "resumptive:0",
          "temporal:2"
        ],
        "structuralOperations": [
          "baseline-split"
        ],
        "lexicalOperations": [
          "baseline-voice-realization",
          "connector-stance-lexicon"
        ],
        "connectorStrategy": "additive",
        "contractionStrategy": "hold",
        "propositionCoverage": 1,
        "actorCoverage": 1,
        "actionCoverage": 1,
        "objectCoverage": 0.95,
        "polarityMismatches": 1,
        "tenseMismatches": 1,
        "protectedAnchorIntegrity": 1
      }
    },
    "archive-grant-rushed-mobile-under-formal-record": {
      "id": "archive-grant-rushed-mobile-under-formal-record",
      "category": "retrieval-same-fact",
      "strength": 0.88,
      "sourceText": "grant isnt just digitize + pray. its shared catalog protocol + 6 steward reviewers + portable exhibit kit. main risk is if description outruns local review and we start calling extraction access. pls keep the 2 wk review buffer + translation line in budget",
      "donorText": "The proposed archive grant has three linked deliverables rather than one large undifferentiated access claim. First, the team will complete a shared cataloging protocol for neighborhood collections now described with inconsistent local vocabularies. Second, six community stewards will be trained to review descriptive language before records are published or exhibited. Third, a portable exhibition kit will be built for circulation through branch libraries, school sites, and tenant meetings. The scheduling risk is not the catalog build itself, but the interval between description and community review. If that interval stretches, the project drifts back toward extractive efficiency rather than reciprocal stewardship. Planning assumptions therefore include a two-week review buffer in each cycle, a modest translation budget, and a rule that no descriptive template is treated as final before local review has actually occurred.",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.88,
        "profile": {
          "avgSentenceLength": 19,
          "sentenceCount": 7,
          "contractionDensity": 0,
          "punctuationDensity": 0.128,
          "contentWordComplexity": 0.588,
          "modifierDensity": 0.115,
          "directness": 0,
          "abstractionPosture": 0.667
        }
      },
      "retrievalTrace": {
        "sourceText": "grant isnt just digitize + pray. its shared catalog protocol + 6 steward reviewers + portable exhibit kit. main risk is if description outruns local review and we start calling extraction access. pls keep the 2 wk review buffer + translation line in budget",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 1,
          "profile": {
            "avgSentenceLength": 20.7,
            "sentenceCount": 4,
            "contractionDensity": 0,
            "punctuationDensity": 0.12,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.543,
            "modifierDensity": 0.103,
            "hedgeDensity": 0.023,
            "directness": 0.04,
            "abstractionPosture": 0.652,
            "latinatePreference": 0.116,
            "recurrencePressure": 0.145
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 4,
            "clauseCount": 5,
            "literalSpans": [
              {
                "value": "6",
                "placeholder": "__PROTLIT_A__"
              },
              {
                "value": "2",
                "placeholder": "__PROTLIT_B__"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "grant isnt just digitize + pray",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "grant isnt just digitize + pray",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "grant",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                }
              ]
            },
            {
              "id": "s1",
              "raw": "its shared catalog protocol + __PROTLIT_A__ steward reviewers + portable exhibit kit",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "its shared catalog protocol + __PROTLIT_A__ steward reviewers + portable exhibit kit",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "its",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "portable"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "main risk is if description outruns local review and we start calling extraction access",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "main risk is if description outruns local review",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "review",
                  "actor": "",
                  "action": "review",
                  "object": "",
                  "modifiers": [
                    "local"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s2c1",
                  "text": "we start calling extraction access",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "start",
                  "actor": "we",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "pls keep the __PROTLIT_B__ wk review buffer + translation line in budget",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "pls keep the __PROTLIT_B__ wk review buffer + translation line in budget",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "keep",
                  "actor": "the __PROTLIT_B__",
                  "action": "keep",
                  "object": "protlit b wk review buffer",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "opportunityProfile": {
          "sentenceSplit": 0,
          "sentenceMerge": 3,
          "contraction": 0,
          "connector": 1,
          "lineBreak": 3,
          "abbreviation": 2,
          "orthography": 5,
          "fragment": 1,
          "conversational": 1,
          "additive": 1,
          "contrastive": 0,
          "causal": 0,
          "temporal": 0,
          "clarifying": 0,
          "resumptive": 0
        },
        "planSummary": {
          "transferMode": "expand",
          "structuralOperationsSelected": [
            "merge-pairs",
            "clause-texture"
          ],
          "lexicalRegisterOperationsSelected": [],
          "connectorStrategy": "additive",
          "contractionStrategy": "hold",
          "relationInventory": {
            "additive": 1,
            "contrastive": 0,
            "causal": 0,
            "temporal": 0,
            "clarifying": 0,
            "resumptive": 0
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": 10.7
          },
          "discourseGoals": {
            "contractionDelta": 0,
            "hedgeDelta": -0.0020000000000000018
          },
          "registerGoals": {
            "contentWordComplexityDelta": 0.15800000000000003,
            "modifierDensityDelta": 0.041999999999999996,
            "directnessDelta": -0.13999999999999999,
            "abstractionDelta": 0.15200000000000002,
            "latinateDelta": -0.0049999999999999906,
            "registerMode": "compressed"
          },
          "operationBudget": {
            "splitSentence": 0,
            "mergeSentence": 10,
            "swapConnector": 2,
            "applyHedge": 0,
            "realizeLexicon": 5
          }
        },
        "candidateSummary": {
          "selected": {
            "spec": "ir-beam-search",
            "score": 481.091,
            "passesApplied": [
              "merge-pairs",
              "clause-texture"
            ],
            "rescuePasses": [],
            "changedDimensions": [
              "sentence-mean",
              "sentence-count",
              "sentence-spread",
              "connector-stance",
              "lexical-register",
              "directness",
              "abbreviation-posture",
              "orthography-posture",
              "fragment-posture",
              "surface-marker-posture",
              "punctuation-shape"
            ],
            "qualityGatePassed": true,
            "notes": []
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 481.091,
              "passesApplied": [
                "merge-pairs",
                "clause-texture"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "directness",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "surface-marker-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "mixed-structural",
              "score": 390.174,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "connector-stance-lexicon",
                "punctuation-finish"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "directness",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "merge-heavy",
              "score": 390.174,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "connector-stance-lexicon",
                "punctuation-finish"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "directness",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "connector-stance-heavy",
              "score": 389.388,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "connector-stance-lexicon"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "directness",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "lexical-register-heavy",
              "score": 389.388,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "connector-stance-lexicon"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "directness",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            }
          ]
        },
        "finalRealization": {
          "text": "Grant isnt just digitize, pray, and its shared catalog protocol, 6 steward reviewers, portable exhibit kit. Main risk is if description outruns local review and we begin contacting extraction access, and please retain the 2 week review buffer, translation line in budget.",
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "sentence-spread",
            "connector-stance",
            "lexical-register",
            "directness",
            "abbreviation-posture",
            "orthography-posture",
            "fragment-posture",
            "surface-marker-posture",
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "keep",
              "from": "keep",
              "to": "retain",
              "kind": "lexeme"
            },
            {
              "family": "start",
              "from": "start",
              "to": "begin",
              "kind": "lexeme"
            },
            {
              "family": "call",
              "from": "calling",
              "to": "contacting",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "donorProgress": {
            "eligible": true,
            "sourceDonorDistance": 5.589,
            "outputDonorDistance": 2.4,
            "donorImprovement": 3.189,
            "donorImprovementRatio": 0.571,
            "sourceOutputLexicalOverlap": 0.773
          },
          "rescuePasses": [
            "td613-aperture-warning"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "semanticAudit": {
          "propositionCoverage": 1,
          "actorCoverage": 0.83,
          "actionCoverage": 1,
          "objectCoverage": 0.95,
          "polarityMismatches": 1,
          "tenseMismatches": 0,
          "protectedAnchorIntegrity": 1,
          "clauseAudits": [
            {
              "sourceClauseId": "s0c0",
              "matchedClauseId": "s0c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.5,
              "globalBagScore": 0.1
            },
            {
              "sourceClauseId": "s1c0",
              "matchedClauseId": "s0c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 1,
              "tenseMismatch": 0,
              "bagScore": 0.333,
              "globalBagScore": 0.091
            },
            {
              "sourceClauseId": "s2c0",
              "matchedClauseId": "s1c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.2
            },
            {
              "sourceClauseId": "s2c1",
              "matchedClauseId": "s1c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.167,
              "globalBagScore": 0.1
            },
            {
              "sourceClauseId": "s3c0",
              "matchedClauseId": "s1c0+s1c1",
              "propositionCoverage": 1,
              "actorCoverage": 0.15,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.167,
              "globalBagScore": 0.143
            }
          ],
          "sourceClauseCount": 5,
          "outputClauseCount": 3
        },
        "protectedAnchorAudit": {
          "totalAnchors": 2,
          "resolvedAnchors": 2,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 2,
            "clauseCount": 3,
            "literalSpans": [
              {
                "value": "6",
                "placeholder": "__PROTLIT_A__"
              },
              {
                "value": "2",
                "placeholder": "__PROTLIT_B__"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Grant isnt just digitize, pray, and its shared catalog protocol, 6 steward reviewers, portable exhibit kit",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Grant isnt just digitize, pray, and its shared catalog protocol, 6 steward reviewers, portable exhibit kit",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "grant",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "portable"
                  ],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                }
              ]
            },
            {
              "id": "s1",
              "raw": "Main risk is if description outruns local review and we begin contacting extraction access, and please retain the 2 week review buffer, translation line in budget.",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "Main risk is if description outruns local review",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "review",
                  "actor": "",
                  "action": "review",
                  "object": "",
                  "modifiers": [
                    "local"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s1c1",
                  "text": "we begin contacting extraction access, and please retain the 2 week review buffer, translation line in budget",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "begin",
                  "actor": "we",
                  "action": "begin",
                  "object": "contacting extraction access please retain",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "realizationSummary": {
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "sentence-spread",
            "connector-stance",
            "lexical-register",
            "directness",
            "abbreviation-posture",
            "orthography-posture",
            "fragment-posture",
            "surface-marker-posture",
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "keep",
              "from": "keep",
              "to": "retain",
              "kind": "lexeme"
            },
            {
              "family": "start",
              "from": "start",
              "to": "begin",
              "kind": "lexeme"
            },
            {
              "family": "call",
              "from": "calling",
              "to": "contacting",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "donorProgress": {
            "eligible": true,
            "sourceDonorDistance": 5.589,
            "outputDonorDistance": 2.4,
            "donorImprovement": 3.189,
            "donorImprovementRatio": 0.571,
            "sourceOutputLexicalOverlap": 0.773
          },
          "realizationNotes": [
            "3 lexical family swaps landed.",
            "Register shift surfaced through lexical-register, directness, abbreviation-posture, orthography-posture, fragment-posture, surface-marker-posture.",
            "Semantic risk is elevated; review the realized output before relying on it."
          ],
          "rescuePasses": [
            "td613-aperture-warning"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "generatorVersion": "v2",
        "sourceClass": "formal-correspondence",
        "candidateLedger": [
          {
            "id": "base",
            "envelopeId": "matron",
            "status": "eligible",
            "score": 0.8628,
            "rewriteStrength": 1,
            "targetFit": 0.5712,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Grant isnt just digitize, pray, and its shared catalog protocol, 6 steward reviewers, portable exhibit kit. Main risk is if description outruns local review and"
          },
          {
            "id": "amplified",
            "envelopeId": "matron",
            "status": "eligible",
            "score": 0.87,
            "rewriteStrength": 1,
            "targetFit": 0.5938,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Grant isnt just digitize, pray, and its shared catalog protocol, 6 steward reviewers, portable exhibit kit. Main risk is if description outruns local review and"
          },
          {
            "id": "contrast",
            "envelopeId": "matron",
            "status": "selected",
            "score": 0.8712,
            "rewriteStrength": 1,
            "targetFit": 0.5976,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Grant isnt just digitize, pray, and its shared catalog protocol, 6 steward reviewers, portable exhibit kit. Main risk is if description outruns local review and"
          },
          {
            "id": "conservative",
            "envelopeId": "matron",
            "status": "eligible",
            "score": 0.8685,
            "rewriteStrength": 1,
            "targetFit": 0.5891,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Grant isnt just digitize, pray, and its shared catalog protocol, 6 steward reviewers, portable exhibit kit. Main risk is if description outruns local review and"
          }
        ],
        "generationDocket": {
          "status": "landed",
          "holdClass": null,
          "headline": "Generator V2 landed a registered rewrite.",
          "reasons": [],
          "candidateCount": 4,
          "winningCandidateId": "contrast"
        },
        "winningCandidateId": "contrast"
      },
      "semanticContract": {
        "transferClass": "structural",
        "realizationTier": "lexical-structural",
        "changedDimensions": [
          "abbreviation-posture",
          "connector-stance",
          "directness",
          "fragment-posture",
          "lexical-register",
          "orthography-posture",
          "punctuation-shape",
          "sentence-count",
          "sentence-mean",
          "sentence-spread",
          "surface-marker-posture"
        ],
        "lexemeSwapFamilies": [
          "call",
          "keep",
          "start"
        ],
        "relationInventory": [
          "additive:1",
          "causal:0",
          "clarifying:0",
          "contrastive:0",
          "resumptive:0",
          "temporal:0"
        ],
        "structuralOperations": [
          "clause-texture",
          "merge-pairs"
        ],
        "lexicalOperations": [],
        "connectorStrategy": "additive",
        "contractionStrategy": "hold",
        "propositionCoverage": 1,
        "actorCoverage": 0.83,
        "actionCoverage": 1,
        "objectCoverage": 0.95,
        "polarityMismatches": 1,
        "tenseMismatches": 0,
        "protectedAnchorIntegrity": 1
      }
    },
    "adversarial-hearing-professional-message-under-rushed-mobile": {
      "id": "adversarial-hearing-professional-message-under-rushed-mobile",
      "category": "retrieval-same-fact",
      "strength": 0.88,
      "sourceText": "Hearing unit, please correct the way the July 3 record is framing the June inspection. Counsel kept calling it a \"refusal of entry,\" but the notice window was 1:00-5:00 PM and the inspector did not text until 5:43 that he was still in traffic. Camera time places arrival after 6:10. The claimant had already left for the medical pickup she flagged earlier that day. That is a late inspection, not a refusal. If the refusal label stays in the summary, the schedule breach disappears and the whole case leans on the wrong premise.",
      "donorText": "hearing got ugly. they keep saying she \"refused entry\" but inspector texted 5:43 he was late + showed after 6:10 on a 1-5 window. she left for med pickup she already told them abt. thats not refusal its them being late",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.88,
        "profile": {
          "avgSentenceLength": 10.75,
          "sentenceCount": 4,
          "contractionDensity": 0,
          "punctuationDensity": 0.14,
          "contentWordComplexity": 0.189,
          "modifierDensity": 0.065,
          "directness": 0.18,
          "abstractionPosture": 0
        }
      },
      "retrievalTrace": {
        "sourceText": "Hearing unit, please correct the way the July 3 record is framing the June inspection. Counsel kept calling it a \"refusal of entry,\" but the notice window was 1:00-5:00 PM and the inspector did not text until 5:43 that he was still in traffic. Camera time places arrival after 6:10. The claimant had already left for the medical pickup she flagged earlier that day. That is a late inspection, not a refusal. If the refusal label stays in the summary, the schedule breach disappears and the whole case leans on the wrong premise.",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.88,
          "profile": {
            "avgSentenceLength": 10.87,
            "sentenceCount": 6,
            "contractionDensity": 0,
            "punctuationDensity": 0.14,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.222,
            "modifierDensity": 0.078,
            "hedgeDensity": 0,
            "directness": 0.137,
            "abstractionPosture": 0.5,
            "latinatePreference": 0.062,
            "recurrencePressure": 0.137
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 6,
            "clauseCount": 7,
            "literalSpans": [
              {
                "value": "1:00",
                "placeholder": "__PROTLIT_A__"
              },
              {
                "value": "5:00 PM",
                "placeholder": "__PROTLIT_B__"
              },
              {
                "value": "5:43",
                "placeholder": "__PROTLIT_C__"
              },
              {
                "value": "6:10",
                "placeholder": "__PROTLIT_D__"
              },
              {
                "value": "\"refusal of entry,\"",
                "placeholder": "__PROTLIT_E__"
              },
              {
                "value": "3",
                "placeholder": "__PROTLIT_F__"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Hearing unit, please correct the way the July __PROTLIT_F__ record is framing the June inspection",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Hearing unit, please correct the way the July __PROTLIT_F__ record is framing the June inspection",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "progressive",
                  "propositionHead": "is",
                  "actor": "the way",
                  "action": "is",
                  "object": "framing june inspection",
                  "modifiers": [
                    "july"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "Counsel kept calling it a __PROTLIT_E__ but the notice window was __PROTLIT_A__-__PROTLIT_B__ and the inspector did not text until __PROTLIT_C__ that he was still in traffic",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "Counsel kept calling it a __PROTLIT_E__ but the notice window was __PROTLIT_A__-__PROTLIT_B__ and the inspector did not text",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "kept",
                  "actor": "it",
                  "action": "kept",
                  "object": "calling protlit e notice window",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s1c1",
                  "text": "__PROTLIT_C__ that he was still in traffic",
                  "relationToPrev": "contrastive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "was",
                  "actor": "that",
                  "action": "was",
                  "object": "traffic",
                  "modifiers": [
                    "traffic"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "Camera time places arrival after __PROTLIT_D__",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "Camera time places arrival after __PROTLIT_D__",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "camera",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "arrival"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "The claimant had already left for the medical pickup she flagged earlier that day",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "The claimant had already left for the medical pickup she flagged earlier that day",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "left",
                  "actor": "The claimant",
                  "action": "left",
                  "object": "medical pickup flagged earlier day",
                  "modifiers": [
                    "medical"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "That is a late inspection, not a refusal",
              "rhetoricalRole": "clarifying",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "That is a late inspection, not a refusal",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "is",
                  "actor": "That",
                  "action": "is",
                  "object": "late inspection refusal",
                  "modifiers": [
                    "refusal"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "If the refusal label stays in the summary, the schedule breach disappears and the whole case leans on the wrong premise.",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "If the refusal label stays in the summary, the schedule breach disappears and the whole case leans on the wrong premise",
                  "relationToPrev": "start",
                  "clauseType": "subordinate",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "schedule",
                  "actor": "the refusal",
                  "action": "schedule",
                  "object": "breach disappears whole case leans",
                  "modifiers": [
                    "refusal"
                  ],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "opportunityProfile": {
          "sentenceSplit": 0,
          "sentenceMerge": 5,
          "contraction": 2,
          "connector": 5,
          "lineBreak": 5,
          "abbreviation": 0,
          "orthography": 0,
          "fragment": 0,
          "conversational": 0,
          "additive": 2,
          "contrastive": 2,
          "causal": 0,
          "temporal": 1,
          "clarifying": 1,
          "resumptive": 1
        },
        "planSummary": {
          "transferMode": "compress",
          "structuralOperationsSelected": [
            "clause-texture"
          ],
          "lexicalRegisterOperationsSelected": [],
          "connectorStrategy": "additive",
          "contractionStrategy": "hold",
          "relationInventory": {
            "additive": 2,
            "contrastive": 2,
            "causal": 0,
            "temporal": 1,
            "clarifying": 1,
            "resumptive": 1
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": -5.459999999999999
          },
          "discourseGoals": {
            "contractionDelta": 0,
            "hedgeDelta": 0
          },
          "registerGoals": {
            "contentWordComplexityDelta": -0.10500000000000001,
            "modifierDensityDelta": -0.040999999999999995,
            "directnessDelta": 0.137,
            "abstractionDelta": 0,
            "latinateDelta": 0.011000000000000003,
            "registerMode": "compressed"
          },
          "operationBudget": {
            "splitSentence": 9,
            "mergeSentence": 0,
            "swapConnector": 2,
            "applyHedge": 2,
            "realizeLexicon": 5
          }
        },
        "candidateSummary": {
          "selected": {
            "spec": "ir-beam-search",
            "score": 378.974,
            "passesApplied": [
              "baseline-floor",
              "clause-texture"
            ],
            "rescuePasses": [],
            "changedDimensions": [
              "sentence-mean",
              "sentence-count",
              "sentence-spread",
              "connector-stance",
              "lexical-register",
              "abbreviation-posture",
              "orthography-posture",
              "punctuation-shape"
            ],
            "qualityGatePassed": true,
            "notes": []
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 378.974,
              "passesApplied": [
                "baseline-floor",
                "clause-texture"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "abbreviation-posture",
                "orthography-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "mixed-structural",
              "score": 345,
              "passesApplied": [
                "baseline-split",
                "baseline-voice-realization",
                "planned-sentence-split",
                "connector-stance-lexicon",
                "punctuation-finish"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "connector-stance",
                "lexical-register",
                "orthography-posture",
                "fragment-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "split-heavy",
              "score": 345,
              "passesApplied": [
                "baseline-split",
                "baseline-voice-realization",
                "planned-sentence-split",
                "connector-stance-lexicon",
                "punctuation-finish"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "connector-stance",
                "lexical-register",
                "orthography-posture",
                "fragment-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "connector-stance-heavy",
              "score": 345,
              "passesApplied": [
                "baseline-split",
                "baseline-voice-realization",
                "planned-sentence-split",
                "connector-stance-lexicon",
                "punctuation-finish"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "connector-stance",
                "lexical-register",
                "orthography-posture",
                "fragment-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "lexical-register-heavy",
              "score": 346.21,
              "passesApplied": [
                "baseline-split",
                "baseline-voice-realization",
                "planned-sentence-split",
                "connector-stance-lexicon"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "orthography-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            }
          ]
        },
        "finalRealization": {
          "text": "Hearing unit, pls correct the way the July 3 record is framing the June inspection. Counsel kept calling it a \"refusal of entry,\" but the notice window was 1:00-5:00 PM and the inspector didnt text until 5:43 that he was still in traffic. Camera time places arrival after 6:10. The claimant had already left for the medical pickup she flagged earlier that day. That is a late inspection, not a refusal, if the refusal label stays in the summary. The book breach disappears and the whole case leans on the wrong premise.",
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-spread",
            "connector-stance",
            "abbreviation-posture",
            "orthography-posture"
          ],
          "lexemeSwaps": [
            {
              "family": "book",
              "from": "schedule",
              "to": "book",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "donorProgress": {
            "eligible": true,
            "sourceDonorDistance": 3.242,
            "outputDonorDistance": 1.909,
            "donorImprovement": 1.333,
            "donorImprovementRatio": 0.411,
            "sourceOutputLexicalOverlap": 0.921
          },
          "rescuePasses": [
            "td613-aperture-warning"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "semanticAudit": {
          "propositionCoverage": 1,
          "actorCoverage": 1,
          "actionCoverage": 1,
          "objectCoverage": 0.964,
          "polarityMismatches": 0,
          "tenseMismatches": 0,
          "protectedAnchorIntegrity": 1,
          "clauseAudits": [
            {
              "sourceClauseId": "s0c0",
              "matchedClauseId": "s0c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.179
            },
            {
              "sourceClauseId": "s1c0",
              "matchedClauseId": "s1c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.5,
              "globalBagScore": 0.133
            },
            {
              "sourceClauseId": "s1c1",
              "matchedClauseId": "s1c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.036
            },
            {
              "sourceClauseId": "s2c0",
              "matchedClauseId": "s2c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.071
            },
            {
              "sourceClauseId": "s3c0",
              "matchedClauseId": "s3c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.25
            },
            {
              "sourceClauseId": "s4c0",
              "matchedClauseId": "s4c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.107
            },
            {
              "sourceClauseId": "s5c0",
              "matchedClauseId": "s4c1+s5c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.25
            }
          ],
          "sourceClauseCount": 7,
          "outputClauseCount": 8
        },
        "protectedAnchorAudit": {
          "totalAnchors": 6,
          "resolvedAnchors": 6,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 6,
            "clauseCount": 8,
            "literalSpans": [
              {
                "value": "1:00",
                "placeholder": "__PROTLIT_A__"
              },
              {
                "value": "5:00 PM",
                "placeholder": "__PROTLIT_B__"
              },
              {
                "value": "5:43",
                "placeholder": "__PROTLIT_C__"
              },
              {
                "value": "6:10",
                "placeholder": "__PROTLIT_D__"
              },
              {
                "value": "\"refusal of entry,\"",
                "placeholder": "__PROTLIT_E__"
              },
              {
                "value": "3",
                "placeholder": "__PROTLIT_F__"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Hearing unit, pls correct the way the July 3 record is framing the June inspection",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Hearing unit, pls correct the way the July 3 record is framing the June inspection",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "progressive",
                  "propositionHead": "is",
                  "actor": "the way",
                  "action": "is",
                  "object": "framing june inspection",
                  "modifiers": [
                    "july"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "Counsel kept calling it a \"refusal of entry,\" but the notice window was 1:00-5:00 PM and the inspector didnt text until 5:43 that he was still in traffic",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "Counsel kept calling it a \"refusal of entry,\" but the notice window was 1:00-5:00 PM and the inspector didnt text",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "kept",
                  "actor": "it",
                  "action": "kept",
                  "object": "calling refusal entry notice window",
                  "modifiers": [
                    "refusal"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s1c1",
                  "text": "5:43 that he was still in traffic",
                  "relationToPrev": "contrastive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "was",
                  "actor": "that",
                  "action": "was",
                  "object": "traffic",
                  "modifiers": [
                    "traffic"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "Camera time places arrival after 6:10",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "Camera time places arrival after 6:10",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "camera",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "arrival"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "The claimant had already left for the medical pickup she flagged earlier that day",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "The claimant had already left for the medical pickup she flagged earlier that day",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "left",
                  "actor": "The claimant",
                  "action": "left",
                  "object": "medical pickup flagged earlier day",
                  "modifiers": [
                    "medical"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "That is a late inspection, not a refusal, if the refusal label stays in the summary",
              "rhetoricalRole": "clarifying",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "That is a late inspection, not a refusal",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "is",
                  "actor": "That",
                  "action": "is",
                  "object": "late inspection refusal",
                  "modifiers": [
                    "refusal"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s4c1",
                  "text": "the refusal label stays in the summary",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "refusal",
                  "actor": "the refusal",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "refusal"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "The book breach disappears and the whole case leans on the wrong premise.",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "The book breach disappears and the whole case leans on the wrong premise",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "book",
                  "actor": "The book",
                  "action": "book",
                  "object": "breach disappears whole case leans",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "realizationSummary": {
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-spread",
            "connector-stance",
            "abbreviation-posture",
            "orthography-posture"
          ],
          "lexemeSwaps": [
            {
              "family": "book",
              "from": "schedule",
              "to": "book",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "donorProgress": {
            "eligible": true,
            "sourceDonorDistance": 3.242,
            "outputDonorDistance": 1.909,
            "donorImprovement": 1.333,
            "donorImprovementRatio": 0.411,
            "sourceOutputLexicalOverlap": 0.921
          },
          "realizationNotes": [
            "1 lexical family swap landed.",
            "Register shift surfaced through lexical-register, abbreviation-posture, orthography-posture.",
            "Semantic risk is elevated; review the realized output before relying on it."
          ],
          "rescuePasses": [
            "td613-aperture-warning"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "generatorVersion": "v2",
        "sourceClass": "procedural-record",
        "candidateLedger": [
          {
            "id": "base",
            "envelopeId": "spark",
            "status": "selected",
            "score": 0.5387,
            "rewriteStrength": 0.6209,
            "targetFit": 0.3268,
            "movementConfidence": 0.72,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Hearing unit, pls correct the way the July 3 record is framing the June inspection. Counsel kept calling it a \"refusal of entry,\" but the notice window was 1:00"
          },
          {
            "id": "amplified",
            "envelopeId": "spark",
            "status": "eligible",
            "score": 0.5295,
            "rewriteStrength": 0.6209,
            "targetFit": 0.2906,
            "movementConfidence": 0.74,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Hearing unit, pls correct the way the July 3 record is framing the June inspection. Counsel kept calling it a \"refusal of entry,\" but the notice window was 1:00"
          },
          {
            "id": "contrast",
            "envelopeId": "spark",
            "status": "eligible",
            "score": 0.526,
            "rewriteStrength": 0.6209,
            "targetFit": 0.2797,
            "movementConfidence": 0.74,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Hearing unit, pls correct the way the July 3 record is framing the June inspection. Counsel kept calling it a \"refusal of entry,\" but the notice window was 1:00"
          },
          {
            "id": "conservative",
            "envelopeId": "spark",
            "status": "eligible",
            "score": 0.5327,
            "rewriteStrength": 0.6209,
            "targetFit": 0.3006,
            "movementConfidence": 0.74,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Hearing unit, pls correct the way the July 3 record is framing the June inspection. Counsel kept calling it a \"refusal of entry,\" but the notice window was 1:00"
          }
        ],
        "generationDocket": {
          "status": "landed",
          "holdClass": null,
          "headline": "Generator V2 landed a registered rewrite.",
          "reasons": [],
          "candidateCount": 4,
          "winningCandidateId": "base"
        },
        "winningCandidateId": "base"
      },
      "semanticContract": {
        "transferClass": "structural",
        "realizationTier": "lexical-structural",
        "changedDimensions": [
          "abbreviation-posture",
          "connector-stance",
          "orthography-posture",
          "sentence-spread"
        ],
        "lexemeSwapFamilies": [
          "book"
        ],
        "relationInventory": [
          "additive:2",
          "causal:0",
          "clarifying:1",
          "contrastive:2",
          "resumptive:1",
          "temporal:1"
        ],
        "structuralOperations": [
          "clause-texture"
        ],
        "lexicalOperations": [],
        "connectorStrategy": "additive",
        "contractionStrategy": "hold",
        "propositionCoverage": 1,
        "actorCoverage": 1,
        "actionCoverage": 1,
        "objectCoverage": 0.964,
        "polarityMismatches": 0,
        "tenseMismatches": 0,
        "protectedAnchorIntegrity": 1
      }
    },
    "adversarial-hearing-rushed-mobile-under-professional-message": {
      "id": "adversarial-hearing-rushed-mobile-under-professional-message",
      "category": "retrieval-same-fact",
      "strength": 0.88,
      "sourceText": "hearing got ugly. they keep saying she \"refused entry\" but inspector texted 5:43 he was late + showed after 6:10 on a 1-5 window. she left for med pickup she already told them abt. thats not refusal its them being late",
      "donorText": "Hearing unit, please correct the way the July 3 record is framing the June inspection. Counsel kept calling it a \"refusal of entry,\" but the notice window was 1:00-5:00 PM and the inspector did not text until 5:43 that he was still in traffic. Camera time places arrival after 6:10. The claimant had already left for the medical pickup she flagged earlier that day. That is a late inspection, not a refusal. If the refusal label stays in the summary, the schedule breach disappears and the whole case leans on the wrong premise.",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.88,
        "profile": {
          "avgSentenceLength": 16.33,
          "sentenceCount": 6,
          "contractionDensity": 0,
          "punctuationDensity": 0.153,
          "contentWordComplexity": 0.327,
          "modifierDensity": 0.119,
          "directness": 0,
          "abstractionPosture": 0.5
        }
      },
      "retrievalTrace": {
        "sourceText": "hearing got ugly. they keep saying she \"refused entry\" but inspector texted 5:43 he was late + showed after 6:10 on a 1-5 window. she left for med pickup she already told them abt. thats not refusal its them being late",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 1,
          "profile": {
            "avgSentenceLength": 18.03,
            "sentenceCount": 4,
            "contractionDensity": 0,
            "punctuationDensity": 0.145,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.297,
            "modifierDensity": 0.107,
            "hedgeDensity": 0,
            "directness": 0.04,
            "abstractionPosture": 0.522,
            "latinatePreference": 0.054,
            "recurrencePressure": 0.182
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 4,
            "clauseCount": 4,
            "literalSpans": [
              {
                "value": "5:43",
                "placeholder": "__PROTLIT_A__"
              },
              {
                "value": "6:10",
                "placeholder": "__PROTLIT_B__"
              },
              {
                "value": "\"refused entry\"",
                "placeholder": "__PROTLIT_C__"
              },
              {
                "value": "1-5",
                "placeholder": "__PROTLIT_D__"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "hearing got ugly",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "hearing got ugly",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "got",
                  "actor": "",
                  "action": "got",
                  "object": "ugly",
                  "modifiers": [
                    "ugly"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "they keep saying she __PROTLIT_C__ but inspector texted __PROTLIT_A__ he was late + showed after __PROTLIT_B__ on a __PROTLIT_D__ window",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "they keep saying she __PROTLIT_C__ but inspector texted __PROTLIT_A__ he was late + showed after __PROTLIT_B__ on a __PROTLIT_D__ window",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "keep",
                  "actor": "they",
                  "action": "keep",
                  "object": "saying protlit c inspector texted",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "she left for med pickup she already told them abt",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "she left for med pickup she already told them abt",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "left",
                  "actor": "she",
                  "action": "left",
                  "object": "med pickup already told them",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "thats not refusal its them being late",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "thats not refusal its them being late",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "being",
                  "actor": "",
                  "action": "being",
                  "object": "late",
                  "modifiers": [
                    "refusal"
                  ],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "opportunityProfile": {
          "sentenceSplit": 0,
          "sentenceMerge": 3,
          "contraction": 0,
          "connector": 1,
          "lineBreak": 3,
          "abbreviation": 0,
          "orthography": 5,
          "fragment": 0,
          "conversational": 0,
          "additive": 0,
          "contrastive": 1,
          "causal": 0,
          "temporal": 1,
          "clarifying": 0,
          "resumptive": 0
        },
        "planSummary": {
          "transferMode": "expand",
          "structuralOperationsSelected": [
            "baseline-merge",
            "sentence-structure",
            "clause-join-split"
          ],
          "lexicalRegisterOperationsSelected": [
            "baseline-voice-realization",
            "punctuation-finish"
          ],
          "connectorStrategy": "contrastive",
          "contractionStrategy": "hold",
          "relationInventory": {
            "additive": 0,
            "contrastive": 1,
            "causal": 0,
            "temporal": 1,
            "clarifying": 0,
            "resumptive": 0
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": 7.280000000000001
          },
          "discourseGoals": {
            "contractionDelta": 0,
            "hedgeDelta": 0
          },
          "registerGoals": {
            "contentWordComplexityDelta": 0.10799999999999998,
            "modifierDensityDelta": 0.041999999999999996,
            "directnessDelta": -0.13999999999999999,
            "abstractionDelta": 0.02200000000000002,
            "latinateDelta": -0.011000000000000003,
            "registerMode": "plain"
          },
          "operationBudget": {
            "splitSentence": 0,
            "mergeSentence": 7,
            "swapConnector": 2,
            "applyHedge": 0,
            "realizeLexicon": 5
          }
        },
        "candidateSummary": {
          "selected": {
            "spec": "mixed-structural",
            "score": 299.688,
            "passesApplied": [
              "baseline-merge",
              "baseline-voice-realization",
              "sentence-structure",
              "clause-join-split",
              "punctuation-finish"
            ],
            "rescuePasses": [],
            "changedDimensions": [
              "sentence-mean",
              "sentence-count",
              "sentence-spread",
              "connector-stance",
              "abbreviation-posture",
              "orthography-posture",
              "punctuation-shape"
            ],
            "qualityGatePassed": true,
            "notes": []
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 295.824,
              "passesApplied": [
                "merge-pairs",
                "clause-texture"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "abbreviation-posture",
                "orthography-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "mixed-structural",
              "score": 299.688,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "sentence-structure",
                "clause-join-split",
                "punctuation-finish"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "abbreviation-posture",
                "orthography-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "merge-heavy",
              "score": 299.688,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "sentence-structure",
                "clause-join-split",
                "punctuation-finish"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "abbreviation-posture",
                "orthography-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "connector-stance-heavy",
              "score": 299.688,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "sentence-structure",
                "clause-join-split",
                "punctuation-finish"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "abbreviation-posture",
                "orthography-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "lexical-register-heavy",
              "score": 298.824,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "sentence-structure",
                "clause-join-split"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "abbreviation-posture",
                "orthography-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            }
          ]
        },
        "finalRealization": {
          "text": "Hearing got ugly; they keep saying she \"refused entry\" but inspector texted 5:43 he was late; showed after 6:10 on a 1-5 window. She left for med pickup she already told them abt, and that is not refusal its them being late.",
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "sentence-spread",
            "connector-stance",
            "lexical-register",
            "abbreviation-posture",
            "orthography-posture",
            "surface-marker-posture",
            "punctuation-shape"
          ],
          "lexemeSwaps": [],
          "semanticRisk": 0.3,
          "donorProgress": {
            "eligible": true,
            "sourceDonorDistance": 3.513,
            "outputDonorDistance": 2.707,
            "donorImprovement": 0.806,
            "donorImprovementRatio": 0.229,
            "sourceOutputLexicalOverlap": 0.902
          },
          "rescuePasses": [
            "td613-aperture-warning"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "semanticAudit": {
          "propositionCoverage": 1,
          "actorCoverage": 1,
          "actionCoverage": 1,
          "objectCoverage": 0.938,
          "polarityMismatches": 0,
          "tenseMismatches": 0,
          "protectedAnchorIntegrity": 1,
          "clauseAudits": [
            {
              "sourceClauseId": "s0c0",
              "matchedClauseId": "s0c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.091
            },
            {
              "sourceClauseId": "s1c0",
              "matchedClauseId": "s0c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.5,
              "globalBagScore": 0.167
            },
            {
              "sourceClauseId": "s2c0",
              "matchedClauseId": "s1c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.273
            },
            {
              "sourceClauseId": "s3c0",
              "matchedClauseId": "s1c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.5,
              "globalBagScore": 0.091
            }
          ],
          "sourceClauseCount": 4,
          "outputClauseCount": 5
        },
        "protectedAnchorAudit": {
          "totalAnchors": 4,
          "resolvedAnchors": 4,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 2,
            "clauseCount": 5,
            "literalSpans": [
              {
                "value": "5:43",
                "placeholder": "__PROTLIT_A__"
              },
              {
                "value": "6:10",
                "placeholder": "__PROTLIT_B__"
              },
              {
                "value": "\"refused entry\"",
                "placeholder": "__PROTLIT_C__"
              },
              {
                "value": "1-5",
                "placeholder": "__PROTLIT_D__"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Hearing got ugly; they keep saying she \"refused entry\" but inspector texted 5:43 he was late; showed after 6:10 on a 1-5 window",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Hearing got ugly",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "got",
                  "actor": "",
                  "action": "got",
                  "object": "ugly",
                  "modifiers": [
                    "ugly"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s0c1",
                  "text": "they keep saying she \"refused entry\" but inspector texted 5:43 he was late",
                  "relationToPrev": "contrastive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "keep",
                  "actor": "they",
                  "action": "keep",
                  "object": "saying refused entry inspector texted",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s0c2",
                  "text": "showed after 6:10 on a 1-5 window",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "showed",
                  "actor": "a 1",
                  "action": "showed",
                  "object": "after 6 10 1 5",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "She left for med pickup she already told them abt, and that is not refusal its them being late.",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "She left for med pickup she already told them abt",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "left",
                  "actor": "She",
                  "action": "left",
                  "object": "med pickup already told them",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s1c1",
                  "text": "that is not refusal its them being late",
                  "relationToPrev": "clarifying",
                  "clauseType": "relative",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "is",
                  "actor": "that",
                  "action": "is",
                  "object": "refusal its them late",
                  "modifiers": [
                    "refusal"
                  ],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "realizationSummary": {
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "sentence-spread",
            "connector-stance",
            "lexical-register",
            "abbreviation-posture",
            "orthography-posture",
            "surface-marker-posture",
            "punctuation-shape"
          ],
          "lexemeSwaps": [],
          "semanticRisk": 0.3,
          "donorProgress": {
            "eligible": true,
            "sourceDonorDistance": 3.513,
            "outputDonorDistance": 2.707,
            "donorImprovement": 0.806,
            "donorImprovementRatio": 0.229,
            "sourceOutputLexicalOverlap": 0.902
          },
          "realizationNotes": [
            "Register shift surfaced through abbreviation-posture, orthography-posture.",
            "Semantic risk is elevated; review the realized output before relying on it."
          ],
          "rescuePasses": [
            "td613-aperture-warning"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "generatorVersion": "v2",
        "sourceClass": "formal-correspondence",
        "candidateLedger": [
          {
            "id": "base",
            "envelopeId": "matron",
            "status": "eligible",
            "score": 0.8168,
            "rewriteStrength": 1,
            "targetFit": 0.4274,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Hearing got ugly; they keep saying she \"refused entry\" but inspector texted 5:43 he was late, showed after 6:10 on a 1-5 window. She left for med pickup she alr"
          },
          {
            "id": "amplified",
            "envelopeId": "matron",
            "status": "eligible",
            "score": 0.8029,
            "rewriteStrength": 1,
            "targetFit": 0.3841,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Hearing got ugly; they keep saying she \"refused entry\" but inspector texted 5:43 he was late; showed after 6:10 on a 1-5 window. She left for med pickup she alr"
          },
          {
            "id": "contrast",
            "envelopeId": "matron",
            "status": "selected",
            "score": 0.8244,
            "rewriteStrength": 1,
            "targetFit": 0.4512,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Hearing got ugly; they keep saying she \"refused entry\" but inspector texted 5:43 he was late; showed after 6:10 on a 1-5 window. She left for med pickup she alr"
          },
          {
            "id": "conservative",
            "envelopeId": "matron",
            "status": "eligible",
            "score": 0.8222,
            "rewriteStrength": 1,
            "targetFit": 0.4444,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Hearing got ugly; they keep saying she \"refused entry\" but inspector texted 5:43 he was late, showed after 6:10 on a 1-5 window. She left for med pickup she alr"
          }
        ],
        "generationDocket": {
          "status": "landed",
          "holdClass": null,
          "headline": "Generator V2 landed a registered rewrite.",
          "reasons": [],
          "candidateCount": 4,
          "winningCandidateId": "contrast"
        },
        "winningCandidateId": "contrast"
      },
      "semanticContract": {
        "transferClass": "structural",
        "realizationTier": "lexical-structural",
        "changedDimensions": [
          "abbreviation-posture",
          "connector-stance",
          "lexical-register",
          "orthography-posture",
          "punctuation-shape",
          "sentence-count",
          "sentence-mean",
          "sentence-spread",
          "surface-marker-posture"
        ],
        "lexemeSwapFamilies": [],
        "relationInventory": [
          "additive:0",
          "causal:0",
          "clarifying:0",
          "contrastive:1",
          "resumptive:0",
          "temporal:1"
        ],
        "structuralOperations": [
          "baseline-merge",
          "clause-join-split",
          "sentence-structure"
        ],
        "lexicalOperations": [
          "baseline-voice-realization",
          "punctuation-finish"
        ],
        "connectorStrategy": "contrastive",
        "contractionStrategy": "hold",
        "propositionCoverage": 1,
        "actorCoverage": 1,
        "actionCoverage": 1,
        "objectCoverage": 0.938,
        "polarityMismatches": 0,
        "tenseMismatches": 0,
        "protectedAnchorIntegrity": 1
      }
    },
    "benefits-appeal-professional-message-under-rushed-mobile": {
      "id": "benefits-appeal-professional-message-under-rushed-mobile",
      "category": "retrieval-same-fact",
      "strength": 0.88,
      "sourceText": "Hello appeals unit, I am writing about case BA-4427 because the suspension is currently framed as a missing-documents problem when the file shows a routing mismatch instead. The notice was generated May 6 and reached the claimant on May 9. The returned mail flag referenced Elm Street, but the claimant had already updated her address to the Birch Avenue shelter intake desk, and that verification letter is in the file. Intake confirmed on May 10 that the letter exists; it just was not linked to the queue handling the address alert. We filed the fair-hearing request on May 14 and are assembling the packet now. Please review the address-verification thread separately from any identity review so the claimant is not made to rehearse the same proof under the wrong label.",
      "donorText": "ba-4427 isnt a no-doc case. mail got kicked back from elm but she already switched to birch shelter addr + that letter is in file. notice says may 6, client got it may 9. hearing req filed 5/14. pls dont send her back for same proof again under \"missing docs\" bc thats not the block",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.88,
        "profile": {
          "avgSentenceLength": 11.4,
          "sentenceCount": 5,
          "contractionDensity": 0,
          "punctuationDensity": 0.123,
          "contentWordComplexity": 0.166,
          "modifierDensity": 0,
          "directness": 0.18,
          "abstractionPosture": 0
        }
      },
      "retrievalTrace": {
        "sourceText": "Hello appeals unit, I am writing about case BA-4427 because the suspension is currently framed as a missing-documents problem when the file shows a routing mismatch instead. The notice was generated May 6 and reached the claimant on May 9. The returned mail flag referenced Elm Street, but the claimant had already updated her address to the Birch Avenue shelter intake desk, and that verification letter is in the file. Intake confirmed on May 10 that the letter exists; it just was not linked to the queue handling the address alert. We filed the fair-hearing request on May 14 and are assembling the packet now. Please review the address-verification thread separately from any identity review so the claimant is not made to rehearse the same proof under the wrong label.",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.88,
          "profile": {
            "avgSentenceLength": 11.64,
            "sentenceCount": 6,
            "contractionDensity": 0,
            "punctuationDensity": 0.123,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.23,
            "modifierDensity": 0.025,
            "hedgeDensity": 0.007,
            "directness": 0.137,
            "abstractionPosture": 0.5,
            "latinatePreference": 0.012,
            "recurrencePressure": 0.124
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 6,
            "clauseCount": 11,
            "literalSpans": [
              {
                "value": "BA-4427",
                "placeholder": "__PROTLIT_A__"
              },
              {
                "value": "6",
                "placeholder": "__PROTLIT_B__"
              },
              {
                "value": "9",
                "placeholder": "__PROTLIT_C__"
              },
              {
                "value": "10",
                "placeholder": "__PROTLIT_D__"
              },
              {
                "value": "14",
                "placeholder": "__PROTLIT_E__"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Hello appeals unit, I am writing about case __PROTLIT_A__ because the suspension is currently framed as a missing-documents problem when the file shows a routing mismatch instead",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Hello appeals unit, I am writing about case __PROTLIT_A__",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "progressive",
                  "propositionHead": "am",
                  "actor": "I",
                  "action": "am",
                  "object": "writing about case protlit",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s0c1",
                  "text": "the suspension is currently framed",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "is",
                  "actor": "the suspension",
                  "action": "is",
                  "object": "currently framed",
                  "modifiers": [
                    "currently"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s0c2",
                  "text": "a missing-documents problem",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "missing",
                  "actor": "a missing",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s0c3",
                  "text": "the file shows a routing mismatch instead",
                  "relationToPrev": "contrastive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "shows",
                  "actor": "the file",
                  "action": "shows",
                  "object": "routing mismatch instead",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "The notice was generated May __PROTLIT_B__ and reached the claimant on May __PROTLIT_C__",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "The notice was generated May __PROTLIT_B__ and reached the claimant on May __PROTLIT_C__",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "was",
                  "actor": "The notice",
                  "action": "was",
                  "object": "generated protlit b reached claimant",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "The returned mail flag referenced Elm Street, but the claimant had already updated her address to the Birch Avenue shelter intake desk, and that verification letter is in the file",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "The returned mail flag referenced Elm Street, but the claimant had already updated her address to the Birch Avenue shelter intake desk",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "flag",
                  "actor": "The returned",
                  "action": "flag",
                  "object": "referenced elm street claimant already",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s2c1",
                  "text": "that verification letter is in the file",
                  "relationToPrev": "additive",
                  "clauseType": "relative",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "is",
                  "actor": "that",
                  "action": "is",
                  "object": "file",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "Intake confirmed on May __PROTLIT_D__ that the letter exists; it just was not linked to the queue handling the address alert",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "Intake confirmed on May __PROTLIT_D__ that the letter exists",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "confirmed",
                  "actor": "that",
                  "action": "confirmed",
                  "object": "protlit d letter exists",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s3c1",
                  "text": "it just was not linked to the queue handling the address alert",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "was",
                  "actor": "it",
                  "action": "was",
                  "object": "linked queue handling address alert",
                  "modifiers": [],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                }
              ]
            },
            {
              "id": "s4",
              "raw": "We filed the fair-hearing request on May __PROTLIT_E__ and are assembling the packet now",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "We filed the fair-hearing request on May __PROTLIT_E__ and are assembling the packet now",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "progressive",
                  "propositionHead": "request",
                  "actor": "We",
                  "action": "request",
                  "object": "protlit e assembling packet now",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "Please review the address-verification thread separately from any identity review so the claimant is not made to rehearse the same proof under the wrong label.",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "Please review the address-verification thread separately from any identity review so the claimant is not made to rehearse the same proof under the wrong label",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "review",
                  "actor": "the address",
                  "action": "review",
                  "object": "address verification thread separately from",
                  "modifiers": [
                    "separately"
                  ],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "opportunityProfile": {
          "sentenceSplit": 1,
          "sentenceMerge": 5,
          "contraction": 2,
          "connector": 8,
          "lineBreak": 5,
          "abbreviation": 0,
          "orthography": 0,
          "fragment": 0,
          "conversational": 0,
          "additive": 3,
          "contrastive": 2,
          "causal": 3,
          "temporal": 1,
          "clarifying": 0,
          "resumptive": 0
        },
        "planSummary": {
          "transferMode": "compress",
          "structuralOperationsSelected": [
            "baseline-split"
          ],
          "lexicalRegisterOperationsSelected": [
            "baseline-voice-realization",
            "connector-stance-lexicon"
          ],
          "connectorStrategy": "additive",
          "contractionStrategy": "hold",
          "relationInventory": {
            "additive": 3,
            "contrastive": 2,
            "causal": 3,
            "temporal": 1,
            "clarifying": 0,
            "resumptive": 0
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": -10.689999999999998
          },
          "discourseGoals": {
            "contractionDelta": 0,
            "hedgeDelta": 0
          },
          "registerGoals": {
            "contentWordComplexityDelta": -0.20199999999999999,
            "modifierDensityDelta": 0,
            "directnessDelta": 0.137,
            "abstractionDelta": 0,
            "latinateDelta": -0.038000000000000006,
            "registerMode": "compressed"
          },
          "operationBudget": {
            "splitSentence": 18,
            "mergeSentence": 0,
            "swapConnector": 2,
            "applyHedge": 0,
            "realizeLexicon": 5
          }
        },
        "candidateSummary": {
          "selected": {
            "spec": "mixed-structural",
            "score": 408.482,
            "passesApplied": [
              "baseline-split",
              "baseline-voice-realization",
              "connector-stance-lexicon"
            ],
            "rescuePasses": [],
            "changedDimensions": [
              "sentence-mean",
              "sentence-count",
              "sentence-spread",
              "connector-stance",
              "lexical-register",
              "directness",
              "abbreviation-posture",
              "orthography-posture",
              "fragment-posture",
              "punctuation-shape"
            ],
            "qualityGatePassed": true,
            "notes": []
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 406.982,
              "passesApplied": [
                "baseline-floor",
                "clause-texture"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "directness",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "mixed-structural",
              "score": 408.482,
              "passesApplied": [
                "baseline-split",
                "baseline-voice-realization",
                "connector-stance-lexicon"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "directness",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "split-heavy",
              "score": 408.482,
              "passesApplied": [
                "baseline-split",
                "baseline-voice-realization",
                "connector-stance-lexicon"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "directness",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "connector-stance-heavy",
              "score": 408.482,
              "passesApplied": [
                "baseline-split",
                "baseline-voice-realization",
                "connector-stance-lexicon"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "directness",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "lexical-register-heavy",
              "score": 408.482,
              "passesApplied": [
                "baseline-split",
                "baseline-voice-realization",
                "connector-stance-lexicon"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "directness",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            }
          ]
        },
        "finalRealization": {
          "text": "Hello appeals unit. Im writing about case BA-4427 bc the suspension is currently framed as a missing-documents problem when the file shows a routing mismatch instead. The notice was generated May 6 and reached the claimant on May 9. The returned mail flag referenced Elm Street, but the claimant had already updated her speech to the Birch Avenue shelter intake desk.  That verification letter is in the file. Intake confirmed on May 10 that the letter exists. It just wasnt linked to the queue handling the speech alert. We filed the fair-hearing ask on May 14 and are assembling the packet now. Pls check the address-verification thread separately from any identity check so the claimant is not made to rehearse the same proof under the wrong label.",
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "sentence-spread",
            "connector-stance",
            "lexical-register",
            "directness",
            "abbreviation-posture",
            "orthography-posture",
            "fragment-posture",
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "ask",
              "from": "request",
              "to": "ask",
              "kind": "lexeme"
            },
            {
              "family": "check",
              "from": "review",
              "to": "check",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "donorProgress": {
            "eligible": true,
            "sourceDonorDistance": 4.181,
            "outputDonorDistance": 3.138,
            "donorImprovement": 1.043,
            "donorImprovementRatio": 0.249,
            "sourceOutputLexicalOverlap": 0.871
          },
          "rescuePasses": [
            "td613-aperture-warning"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "semanticAudit": {
          "propositionCoverage": 1,
          "actorCoverage": 1,
          "actionCoverage": 1,
          "objectCoverage": 0.886,
          "polarityMismatches": 0,
          "tenseMismatches": 0,
          "protectedAnchorIntegrity": 1,
          "clauseAudits": [
            {
              "sourceClauseId": "s0c0",
              "matchedClauseId": "s0c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0,
              "globalBagScore": 0
            },
            {
              "sourceClauseId": "s0c1",
              "matchedClauseId": "s1c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.079
            },
            {
              "sourceClauseId": "s0c2",
              "matchedClauseId": "s1c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.026
            },
            {
              "sourceClauseId": "s0c3",
              "matchedClauseId": "s1c2",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.132
            },
            {
              "sourceClauseId": "s1c0",
              "matchedClauseId": "s2c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.5,
              "globalBagScore": 0.1
            },
            {
              "sourceClauseId": "s2c0",
              "matchedClauseId": "s3c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.184
            },
            {
              "sourceClauseId": "s2c1",
              "matchedClauseId": "s4c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.026
            },
            {
              "sourceClauseId": "s3c0",
              "matchedClauseId": "s5c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.5,
              "globalBagScore": 0.075
            },
            {
              "sourceClauseId": "s3c1",
              "matchedClauseId": "s6c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0,
              "globalBagScore": 0.024
            },
            {
              "sourceClauseId": "s4c0",
              "matchedClauseId": "s7c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.571,
              "globalBagScore": 0.1
            },
            {
              "sourceClauseId": "s5c0",
              "matchedClauseId": "s8c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.158
            }
          ],
          "sourceClauseCount": 11,
          "outputClauseCount": 11
        },
        "protectedAnchorAudit": {
          "totalAnchors": 5,
          "resolvedAnchors": 5,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 9,
            "clauseCount": 11,
            "literalSpans": [
              {
                "value": "BA-4427",
                "placeholder": "__PROTLIT_A__"
              },
              {
                "value": "6",
                "placeholder": "__PROTLIT_B__"
              },
              {
                "value": "9",
                "placeholder": "__PROTLIT_C__"
              },
              {
                "value": "10",
                "placeholder": "__PROTLIT_D__"
              },
              {
                "value": "14",
                "placeholder": "__PROTLIT_E__"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Hello appeals unit",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Hello appeals unit",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "hello",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "Im writing about case BA-4427 bc the suspension is currently framed as a missing-documents problem when the file shows a routing mismatch instead",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "Im writing about case BA-4427 bc the suspension is currently framed",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "is",
                  "actor": "the suspension",
                  "action": "is",
                  "object": "currently framed",
                  "modifiers": [
                    "currently"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s1c1",
                  "text": "a missing-documents problem",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "missing",
                  "actor": "a missing",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s1c2",
                  "text": "the file shows a routing mismatch instead",
                  "relationToPrev": "contrastive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "shows",
                  "actor": "the file",
                  "action": "shows",
                  "object": "routing mismatch instead",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "The notice was generated May 6 and reached the claimant on May 9",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "The notice was generated May 6 and reached the claimant on May 9",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "was",
                  "actor": "The notice",
                  "action": "was",
                  "object": "generated 6 reached claimant 9",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "The returned mail flag referenced Elm Street, but the claimant had already updated her speech to the Birch Avenue shelter intake desk",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "The returned mail flag referenced Elm Street, but the claimant had already updated her speech to the Birch Avenue shelter intake desk",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "flag",
                  "actor": "The returned",
                  "action": "flag",
                  "object": "referenced elm street claimant already",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "That verification letter is in the file",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "That verification letter is in the file",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "is",
                  "actor": "That",
                  "action": "is",
                  "object": "file",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "Intake confirmed on May 10 that the letter exists",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "Intake confirmed on May 10 that the letter exists",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "confirmed",
                  "actor": "that",
                  "action": "confirmed",
                  "object": "10 letter exists",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s6",
              "raw": "It just wasnt linked to the queue handling the speech alert",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s6c0",
                  "text": "It just wasnt linked to the queue handling the speech alert",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "wasnt",
                  "actor": "It",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                }
              ]
            },
            {
              "id": "s7",
              "raw": "We filed the fair-hearing ask on May 14 and are assembling the packet now",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s7c0",
                  "text": "We filed the fair-hearing ask on May 14 and are assembling the packet now",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "progressive",
                  "propositionHead": "ask",
                  "actor": "We",
                  "action": "ask",
                  "object": "14 assembling packet now",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s8",
              "raw": "Pls check the address-verification thread separately from any identity check so the claimant is not made to rehearse the same proof under the wrong label.",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s8c0",
                  "text": "Pls check the address-verification thread separately from any identity check so the claimant is not made to rehearse the same proof under the wrong label",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "check",
                  "actor": "the address",
                  "action": "check",
                  "object": "address verification thread separately from",
                  "modifiers": [
                    "separately"
                  ],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "realizationSummary": {
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "sentence-spread",
            "connector-stance",
            "lexical-register",
            "directness",
            "abbreviation-posture",
            "orthography-posture",
            "fragment-posture",
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "ask",
              "from": "request",
              "to": "ask",
              "kind": "lexeme"
            },
            {
              "family": "check",
              "from": "review",
              "to": "check",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "donorProgress": {
            "eligible": true,
            "sourceDonorDistance": 4.181,
            "outputDonorDistance": 3.138,
            "donorImprovement": 1.043,
            "donorImprovementRatio": 0.249,
            "sourceOutputLexicalOverlap": 0.871
          },
          "realizationNotes": [
            "2 lexical family swaps landed.",
            "Register shift surfaced through lexical-register, directness, abbreviation-posture, orthography-posture, fragment-posture.",
            "Semantic risk is elevated; review the realized output before relying on it."
          ],
          "rescuePasses": [
            "td613-aperture-warning"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "generatorVersion": "v2",
        "sourceClass": "formal-correspondence",
        "candidateLedger": [
          {
            "id": "base",
            "envelopeId": "spark",
            "status": "selected",
            "score": 0.74,
            "rewriteStrength": 1,
            "targetFit": 0.1874,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Hello appeals unit. Im writing about case BA-4427 bc the suspension is currently framed as a missing-documents problem when the file shows a routing mismatch in"
          },
          {
            "id": "amplified",
            "envelopeId": "spark",
            "status": "eligible",
            "score": 0.7152,
            "rewriteStrength": 1,
            "targetFit": 0.11,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Hello appeals unit. Im writing about case BA-4427 bc the suspension is currently framed as a missing-documents problem when the file shows a routing mismatch in"
          },
          {
            "id": "contrast",
            "envelopeId": "spark",
            "status": "eligible",
            "score": 0.7109,
            "rewriteStrength": 1,
            "targetFit": 0.0965,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Hello appeals unit. Im writing about case BA-4427 bc the suspension is currently framed as a missing-documents problem when the file shows a routing mismatch in"
          },
          {
            "id": "conservative",
            "envelopeId": "spark",
            "status": "eligible",
            "score": 0.7208,
            "rewriteStrength": 1,
            "targetFit": 0.1274,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Hello appeals unit. Im writing about case BA-4427 bc the suspension is currently framed as a missing-documents problem when the file shows a routing mismatch in"
          }
        ],
        "generationDocket": {
          "status": "landed",
          "holdClass": null,
          "headline": "Generator V2 landed a registered rewrite.",
          "reasons": [],
          "candidateCount": 4,
          "winningCandidateId": "base"
        },
        "winningCandidateId": "base"
      },
      "semanticContract": {
        "transferClass": "structural",
        "realizationTier": "lexical-structural",
        "changedDimensions": [
          "abbreviation-posture",
          "connector-stance",
          "directness",
          "fragment-posture",
          "lexical-register",
          "orthography-posture",
          "punctuation-shape",
          "sentence-count",
          "sentence-mean",
          "sentence-spread"
        ],
        "lexemeSwapFamilies": [
          "ask",
          "check"
        ],
        "relationInventory": [
          "additive:3",
          "causal:3",
          "clarifying:0",
          "contrastive:2",
          "resumptive:0",
          "temporal:1"
        ],
        "structuralOperations": [
          "baseline-split"
        ],
        "lexicalOperations": [
          "baseline-voice-realization",
          "connector-stance-lexicon"
        ],
        "connectorStrategy": "additive",
        "contractionStrategy": "hold",
        "propositionCoverage": 1,
        "actorCoverage": 1,
        "actionCoverage": 1,
        "objectCoverage": 0.886,
        "polarityMismatches": 0,
        "tenseMismatches": 0,
        "protectedAnchorIntegrity": 1
      }
    },
    "benefits-appeal-rushed-mobile-under-professional-message": {
      "id": "benefits-appeal-rushed-mobile-under-professional-message",
      "category": "retrieval-same-fact",
      "strength": 0.88,
      "sourceText": "ba-4427 isnt a no-doc case. mail got kicked back from elm but she already switched to birch shelter addr + that letter is in file. notice says may 6, client got it may 9. hearing req filed 5/14. pls dont send her back for same proof again under \"missing docs\" bc thats not the block",
      "donorText": "Hello appeals unit, I am writing about case BA-4427 because the suspension is currently framed as a missing-documents problem when the file shows a routing mismatch instead. The notice was generated May 6 and reached the claimant on May 9. The returned mail flag referenced Elm Street, but the claimant had already updated her address to the Birch Avenue shelter intake desk, and that verification letter is in the file. Intake confirmed on May 10 that the letter exists; it just was not linked to the queue handling the address alert. We filed the fair-hearing request on May 14 and are assembling the packet now. Please review the address-verification thread separately from any identity review so the claimant is not made to rehearse the same proof under the wrong label.",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.88,
        "profile": {
          "avgSentenceLength": 22.33,
          "sentenceCount": 6,
          "contractionDensity": 0,
          "punctuationDensity": 0.104,
          "contentWordComplexity": 0.432,
          "modifierDensity": 0.025,
          "directness": 0,
          "abstractionPosture": 0.5
        }
      },
      "retrievalTrace": {
        "sourceText": "ba-4427 isnt a no-doc case. mail got kicked back from elm but she already switched to birch shelter addr + that letter is in file. notice says may 6, client got it may 9. hearing req filed 5/14. pls dont send her back for same proof again under \"missing docs\" bc thats not the block",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.8,
          "profile": {
            "avgSentenceLength": 23.02,
            "sentenceCount": 5,
            "contractionDensity": 0,
            "punctuationDensity": 0.1,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.365,
            "modifierDensity": 0.019,
            "hedgeDensity": 0.005,
            "directness": 0.045,
            "abstractionPosture": 0.514,
            "latinatePreference": 0.037,
            "recurrencePressure": 0.189
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 5,
            "clauseCount": 6,
            "literalSpans": [
              {
                "value": "\"missing docs\"",
                "placeholder": "__PROTLIT_A__"
              },
              {
                "value": "ba-4427",
                "placeholder": "__PROTLIT_B__"
              },
              {
                "value": "6",
                "placeholder": "__PROTLIT_C__"
              },
              {
                "value": "9",
                "placeholder": "__PROTLIT_D__"
              },
              {
                "value": "5/14",
                "placeholder": "__PROTLIT_E__"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "__PROTLIT_B__ isnt a no-doc case",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "__PROTLIT_B__ isnt a no-doc case",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "protlit",
                  "actor": "a no",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "mail got kicked back from elm but she already switched to birch shelter addr + that letter is in file",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "mail got kicked back from elm",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "got",
                  "actor": "",
                  "action": "got",
                  "object": "kicked back from elm",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s1c1",
                  "text": "she already switched to birch shelter addr + that letter is in file",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "is",
                  "actor": "she",
                  "action": "is",
                  "object": "file",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "notice says may __PROTLIT_C__, client got it may __PROTLIT_D__",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "notice says may __PROTLIT_C__, client got it may __PROTLIT_D__",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "says",
                  "actor": "it",
                  "action": "says",
                  "object": "protlit c client got protlit",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "hearing req filed __PROTLIT_E__",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "hearing req filed __PROTLIT_E__",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "hearing",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "pls dont send her back for same proof again under __PROTLIT_A__ bc thats not the block",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "pls dont send her back for same proof again under __PROTLIT_A__ bc thats not the block",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "send",
                  "actor": "the block",
                  "action": "send",
                  "object": "her back same proof again",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "opportunityProfile": {
          "sentenceSplit": 0,
          "sentenceMerge": 4,
          "contraction": 0,
          "connector": 2,
          "lineBreak": 4,
          "abbreviation": 2,
          "orthography": 8,
          "fragment": 0,
          "conversational": 0,
          "additive": 0,
          "contrastive": 1,
          "causal": 0,
          "temporal": 0,
          "clarifying": 0,
          "resumptive": 0
        },
        "planSummary": {
          "transferMode": "expand",
          "structuralOperationsSelected": [
            "baseline-merge",
            "planned-sentence-merge",
            "sentence-structure",
            "clause-join-split"
          ],
          "lexicalRegisterOperationsSelected": [
            "baseline-voice-realization",
            "baseline-stance",
            "baseline-function-word",
            "connector-stance-lexicon"
          ],
          "connectorStrategy": "contrastive",
          "contractionStrategy": "hold",
          "relationInventory": {
            "additive": 0,
            "contrastive": 1,
            "causal": 0,
            "temporal": 0,
            "clarifying": 0,
            "resumptive": 0
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": 11.62
          },
          "discourseGoals": {
            "contractionDelta": 0,
            "hedgeDelta": 0.005
          },
          "registerGoals": {
            "contentWordComplexityDelta": 0.19899999999999998,
            "modifierDensityDelta": 0.019,
            "directnessDelta": -0.135,
            "abstractionDelta": 0.014000000000000012,
            "latinateDelta": 0.037,
            "registerMode": "compressed"
          },
          "operationBudget": {
            "splitSentence": 0,
            "mergeSentence": 10,
            "swapConnector": 2,
            "applyHedge": 0,
            "realizeLexicon": 4
          }
        },
        "candidateSummary": {
          "selected": {
            "spec": "mixed-structural",
            "score": 364.902,
            "passesApplied": [
              "baseline-merge",
              "baseline-voice-realization",
              "baseline-stance",
              "baseline-function-word",
              "planned-sentence-merge",
              "sentence-structure",
              "clause-join-split",
              "connector-stance-lexicon",
              "cleanup-restore"
            ],
            "rescuePasses": [],
            "changedDimensions": [
              "sentence-mean",
              "sentence-count",
              "sentence-spread",
              "connector-stance",
              "lexical-register",
              "abbreviation-posture",
              "orthography-posture",
              "surface-marker-posture",
              "punctuation-shape"
            ],
            "qualityGatePassed": true,
            "notes": []
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 455.307,
              "passesApplied": [
                "baseline-floor",
                "clause-texture"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "content-word-complexity",
                "directness",
                "abbreviation-posture",
                "orthography-posture",
                "surface-marker-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "mixed-structural",
              "score": 364.902,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "baseline-stance",
                "baseline-function-word",
                "planned-sentence-merge",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "abbreviation-posture",
                "orthography-posture",
                "surface-marker-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "merge-heavy",
              "score": 364.902,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "baseline-stance",
                "baseline-function-word",
                "planned-sentence-merge",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "abbreviation-posture",
                "orthography-posture",
                "surface-marker-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "connector-stance-heavy",
              "score": 364.902,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "baseline-stance",
                "baseline-function-word",
                "planned-sentence-merge",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "abbreviation-posture",
                "orthography-posture",
                "surface-marker-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "lexical-register-heavy",
              "score": 364.902,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "baseline-stance",
                "baseline-function-word",
                "planned-sentence-merge",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "abbreviation-posture",
                "orthography-posture",
                "surface-marker-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            }
          ]
        },
        "finalRealization": {
          "text": "ba-4427 isnt a no-doc case, but mail got kicked back from elm; yet she already switched to birch shelter addr. That letter is in file, but notice says may 6, client got it may 9 - and hearing req filed 5/14. Pls do not send her back for same proof again under \"missing docs\" bc that is not the block",
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "sentence-spread",
            "connector-stance",
            "lexical-register",
            "abbreviation-posture",
            "orthography-posture",
            "surface-marker-posture",
            "punctuation-shape"
          ],
          "lexemeSwaps": [],
          "semanticRisk": 0.3,
          "donorProgress": {
            "eligible": true,
            "sourceDonorDistance": 4.354,
            "outputDonorDistance": 3.176,
            "donorImprovement": 1.178,
            "donorImprovementRatio": 0.271,
            "sourceOutputLexicalOverlap": 0.912
          },
          "rescuePasses": [
            "td613-aperture-warning"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "semanticAudit": {
          "propositionCoverage": 1,
          "actorCoverage": 0.962,
          "actionCoverage": 1,
          "objectCoverage": 0.917,
          "polarityMismatches": 1,
          "tenseMismatches": 0,
          "protectedAnchorIntegrity": 1,
          "clauseAudits": [
            {
              "sourceClauseId": "s0c0",
              "matchedClauseId": "s0c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.143,
              "globalBagScore": 0.056
            },
            {
              "sourceClauseId": "s1c0",
              "matchedClauseId": "s0c0+s0c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 1,
              "tenseMismatch": 0,
              "bagScore": 0.714,
              "globalBagScore": 0.294
            },
            {
              "sourceClauseId": "s1c1",
              "matchedClauseId": "s1c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0,
              "globalBagScore": 0
            },
            {
              "sourceClauseId": "s2c0",
              "matchedClauseId": "s1c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.429,
              "globalBagScore": 0.158
            },
            {
              "sourceClauseId": "s3c0",
              "matchedClauseId": "s1c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.059
            },
            {
              "sourceClauseId": "s4c0",
              "matchedClauseId": "s2c0",
              "propositionCoverage": 1,
              "actorCoverage": 0.771,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.857,
              "globalBagScore": 0.333
            }
          ],
          "sourceClauseCount": 6,
          "outputClauseCount": 5
        },
        "protectedAnchorAudit": {
          "totalAnchors": 5,
          "resolvedAnchors": 5,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 3,
            "clauseCount": 5,
            "literalSpans": [
              {
                "value": "\"missing docs\"",
                "placeholder": "__PROTLIT_A__"
              },
              {
                "value": "ba-4427",
                "placeholder": "__PROTLIT_B__"
              },
              {
                "value": "6",
                "placeholder": "__PROTLIT_C__"
              },
              {
                "value": "9",
                "placeholder": "__PROTLIT_D__"
              },
              {
                "value": "5/14",
                "placeholder": "__PROTLIT_E__"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "ba-4427 isnt a no-doc case, but mail got kicked back from elm; yet she already switched to birch shelter addr",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "ba-4427 isnt a no-doc case, but mail got kicked back from elm",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "got",
                  "actor": "a no",
                  "action": "got",
                  "object": "kicked back from elm",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s0c1",
                  "text": "yet she already switched to birch shelter addr",
                  "relationToPrev": "contrastive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "already",
                  "actor": "she",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "That letter is in file, but notice says may 6, client got it may 9 - and hearing req filed 5/14",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "That letter is in file, but notice says may 6, client got it may 9",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "says",
                  "actor": "That",
                  "action": "says",
                  "object": "6 client got 9",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s1c1",
                  "text": "and hearing req filed 5/14",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "hearing",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "Pls do not send her back for same proof again under \"missing docs\" bc that is not the block",
              "rhetoricalRole": "clarifying",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "Pls do not send her back for same proof again under \"missing docs\" bc that is not the block",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "send",
                  "actor": "that",
                  "action": "send",
                  "object": "her back same proof again",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "realizationSummary": {
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "sentence-spread",
            "connector-stance",
            "lexical-register",
            "abbreviation-posture",
            "orthography-posture",
            "surface-marker-posture",
            "punctuation-shape"
          ],
          "lexemeSwaps": [],
          "semanticRisk": 0.3,
          "donorProgress": {
            "eligible": true,
            "sourceDonorDistance": 4.354,
            "outputDonorDistance": 3.176,
            "donorImprovement": 1.178,
            "donorImprovementRatio": 0.271,
            "sourceOutputLexicalOverlap": 0.912
          },
          "realizationNotes": [
            "Register shift surfaced through lexical-register, abbreviation-posture, orthography-posture, surface-marker-posture.",
            "Semantic risk is elevated; review the realized output before relying on it."
          ],
          "rescuePasses": [
            "td613-aperture-warning"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "generatorVersion": "v2",
        "sourceClass": "formal-correspondence",
        "candidateLedger": [
          {
            "id": "base",
            "envelopeId": "matron",
            "status": "eligible",
            "score": 0.7737,
            "rewriteStrength": 1,
            "targetFit": 0.2929,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Ba-4427 isnt a no-doc case, but mail got kicked back from elm but she already switched to birch shelter addr, that letter is in file; notice says may 6, client "
          },
          {
            "id": "amplified",
            "envelopeId": "matron",
            "status": "eligible",
            "score": 0.8119,
            "rewriteStrength": 1,
            "targetFit": 0.4121,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Ba-4427 isnt a no-doc case, but mail got kicked back from elm; yet she already switched to birch shelter addr. That letter is in file, but notice says may 6, cl"
          },
          {
            "id": "contrast",
            "envelopeId": "matron",
            "status": "eligible",
            "score": 0.8092,
            "rewriteStrength": 1,
            "targetFit": 0.4038,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Ba-4427 isnt a no-doc case, but mail got kicked back from elm; yet she already switched to birch shelter addr. That letter is in file, but notice says may 6, cl"
          },
          {
            "id": "conservative",
            "envelopeId": "matron",
            "status": "selected",
            "score": 0.8154,
            "rewriteStrength": 1,
            "targetFit": 0.4232,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Ba-4427 isnt a no-doc case, but mail got kicked back from elm; yet she already switched to birch shelter addr. That letter is in file, but notice says may 6, cl"
          }
        ],
        "generationDocket": {
          "status": "landed",
          "holdClass": null,
          "headline": "Generator V2 landed a registered rewrite.",
          "reasons": [],
          "candidateCount": 4,
          "winningCandidateId": "conservative"
        },
        "winningCandidateId": "conservative"
      },
      "semanticContract": {
        "transferClass": "structural",
        "realizationTier": "lexical-structural",
        "changedDimensions": [
          "abbreviation-posture",
          "connector-stance",
          "lexical-register",
          "orthography-posture",
          "punctuation-shape",
          "sentence-count",
          "sentence-mean",
          "sentence-spread",
          "surface-marker-posture"
        ],
        "lexemeSwapFamilies": [],
        "relationInventory": [
          "additive:0",
          "causal:0",
          "clarifying:0",
          "contrastive:1",
          "resumptive:0",
          "temporal:0"
        ],
        "structuralOperations": [
          "baseline-merge",
          "clause-join-split",
          "planned-sentence-merge",
          "sentence-structure"
        ],
        "lexicalOperations": [
          "baseline-function-word",
          "baseline-stance",
          "baseline-voice-realization",
          "connector-stance-lexicon"
        ],
        "connectorStrategy": "contrastive",
        "contractionStrategy": "hold",
        "propositionCoverage": 1,
        "actorCoverage": 0.962,
        "actionCoverage": 1,
        "objectCoverage": 0.917,
        "polarityMismatches": 1,
        "tenseMismatches": 0,
        "protectedAnchorIntegrity": 1
      }
    },
    "museum-fog-alarm-professional-message-under-rushed-mobile": {
      "id": "museum-fog-alarm-professional-message-under-rushed-mobile",
      "category": "retrieval-same-fact",
      "strength": 0.88,
      "sourceText": "Production team, quick correction from Gallery 4: the fog cue at 7:42 PM is what tripped the detector, not an electrical issue. Facilities reset the panel and we resumed at 8:11, but the real problem is that the cue sheet still describes the effect as a light atmospheric wash even though the rig is now outputting closer to a burst. Please adjust the first two passes before tomorrow so we do not reproduce the same alarm under a prettier label.",
      "donorText": "gallery 4 fog rig set off detector again at 7:42. not fire, just too much haze sitting under ceiling head bc fan was low. pls stop calling cue \"light wash\" when its basically a fog burst now. reset finished 8:11",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.88,
        "profile": {
          "avgSentenceLength": 10.5,
          "sentenceCount": 4,
          "contractionDensity": 0,
          "punctuationDensity": 0.143,
          "contentWordComplexity": 0.147,
          "modifierDensity": 0.027,
          "directness": 0,
          "abstractionPosture": 0.5
        }
      },
      "retrievalTrace": {
        "sourceText": "Production team, quick correction from Gallery 4: the fog cue at 7:42 PM is what tripped the detector, not an electrical issue. Facilities reset the panel and we resumed at 8:11, but the real problem is that the cue sheet still describes the effect as a light atmospheric wash even though the rig is now outputting closer to a burst. Please adjust the first two passes before tomorrow so we do not reproduce the same alarm under a prettier label.",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.88,
          "profile": {
            "avgSentenceLength": 10.86,
            "sentenceCount": 3,
            "contractionDensity": 0,
            "punctuationDensity": 0.142,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.191,
            "modifierDensity": 0.038,
            "hedgeDensity": 0.018,
            "directness": 0,
            "abstractionPosture": 0.5,
            "latinatePreference": 0.009,
            "recurrencePressure": 0.133
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 3,
            "clauseCount": 5,
            "literalSpans": [
              {
                "value": "7:42 PM",
                "placeholder": "__PROTLIT_A__"
              },
              {
                "value": "8:11",
                "placeholder": "__PROTLIT_B__"
              },
              {
                "value": "4",
                "placeholder": "__PROTLIT_C__"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Production team, quick correction from Gallery __PROTLIT_C__: the fog cue at __PROTLIT_A__ is what tripped the detector, not an electrical issue",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Production team, quick correction from Gallery __PROTLIT_C__: the fog cue at __PROTLIT_A__ is what tripped the detector, not an electrical issue",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "issue",
                  "actor": "the fog",
                  "action": "issue",
                  "object": "",
                  "modifiers": [
                    "quick",
                    "electrical"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "Facilities reset the panel and we resumed at __PROTLIT_B__, but the real problem is that the cue sheet still describes the effect as a light atmospheric wash even though the rig is now outputting closer to a burst",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "Facilities reset the panel",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "facilities",
                  "actor": "the panel",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s1c1",
                  "text": "we resumed at __PROTLIT_B__, but the real problem is that the cue sheet still describes the effect as a light atmospheric wash even though the rig is now outputting closer to a burst",
                  "relationToPrev": "contrastive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "is",
                  "actor": "we",
                  "action": "is",
                  "object": "cue sheet describes effect light",
                  "modifiers": [
                    "real",
                    "atmospheric"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "Please adjust the first two passes before tomorrow so we do not reproduce the same alarm under a prettier label.",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "Please adjust the first two passes before tomorrow",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "please",
                  "actor": "the first",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s2c1",
                  "text": "we do not reproduce the same alarm under a prettier label",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "do",
                  "actor": "we",
                  "action": "do",
                  "object": "reproduce same alarm under prettier",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "opportunityProfile": {
          "sentenceSplit": 1,
          "sentenceMerge": 2,
          "contraction": 1,
          "connector": 6,
          "lineBreak": 2,
          "abbreviation": 0,
          "orthography": 0,
          "fragment": 0,
          "conversational": 0,
          "additive": 1,
          "contrastive": 3,
          "causal": 2,
          "temporal": 1,
          "clarifying": 0,
          "resumptive": 1
        },
        "planSummary": {
          "transferMode": "compress",
          "structuralOperationsSelected": [
            "split-rules"
          ],
          "lexicalRegisterOperationsSelected": [
            "phrase-texture"
          ],
          "connectorStrategy": "contrastive",
          "contractionStrategy": "hold",
          "relationInventory": {
            "additive": 1,
            "contrastive": 3,
            "causal": 2,
            "temporal": 1,
            "clarifying": 0,
            "resumptive": 1
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": -16.47
          },
          "discourseGoals": {
            "contractionDelta": 0,
            "hedgeDelta": 0.018
          },
          "registerGoals": {
            "contentWordComplexityDelta": -0.138,
            "modifierDensityDelta": -0.037,
            "directnessDelta": 0,
            "abstractionDelta": 0,
            "latinateDelta": -0.028999999999999998,
            "registerMode": "compressed"
          },
          "operationBudget": {
            "splitSentence": 23,
            "mergeSentence": 0,
            "swapConnector": 2,
            "applyHedge": 2,
            "realizeLexicon": 5
          }
        },
        "candidateSummary": {
          "selected": {
            "spec": "ir-beam-search",
            "score": 477.018,
            "passesApplied": [
              "split-rules",
              "phrase-texture"
            ],
            "rescuePasses": [],
            "changedDimensions": [
              "sentence-mean",
              "sentence-count",
              "sentence-spread",
              "connector-stance",
              "lexical-register",
              "abbreviation-posture",
              "orthography-posture",
              "fragment-posture",
              "conversation-posture",
              "surface-marker-posture",
              "punctuation-shape"
            ],
            "qualityGatePassed": true,
            "notes": []
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 477.018,
              "passesApplied": [
                "split-rules",
                "phrase-texture"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "conversation-posture",
                "surface-marker-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "mixed-structural",
              "score": 443.388,
              "passesApplied": [
                "baseline-split",
                "baseline-voice-realization",
                "planned-sentence-split",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "punctuation-finish",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "conversation-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "split-heavy",
              "score": 443.388,
              "passesApplied": [
                "baseline-split",
                "baseline-voice-realization",
                "planned-sentence-split",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "punctuation-finish",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "conversation-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "connector-stance-heavy",
              "score": 443.388,
              "passesApplied": [
                "baseline-split",
                "baseline-voice-realization",
                "planned-sentence-split",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "punctuation-finish",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "conversation-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "lexical-register-heavy",
              "score": 441.534,
              "passesApplied": [
                "baseline-split",
                "baseline-voice-realization",
                "planned-sentence-split",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "conversation-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            }
          ]
        },
        "finalRealization": {
          "text": "Production team, fast correction from Gallery 4. The fog cue at 7:42 PM is what tripped the detector, not an electrical give. Facilities reset the panel.  We resumed at 8:11, but the real problem is that the cue sheet still describes the effect as a light atmospheric wash even though the rig is now outputting closer to a burst. Pls adjust the first two passes before tmrw. So we dont reproduce the same alarm under a prettier label.",
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "sentence-spread",
            "connector-stance",
            "lexical-register",
            "abbreviation-posture",
            "orthography-posture",
            "fragment-posture",
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "fast",
              "from": "quick",
              "to": "fast",
              "kind": "lexeme"
            },
            {
              "family": "give",
              "from": "issue",
              "to": "give",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "donorProgress": {
            "eligible": true,
            "sourceDonorDistance": 4.535,
            "outputDonorDistance": 1.878,
            "donorImprovement": 2.657,
            "donorImprovementRatio": 0.586,
            "sourceOutputLexicalOverlap": 0.859
          },
          "rescuePasses": [
            "td613-aperture-warning"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "semanticAudit": {
          "propositionCoverage": 1,
          "actorCoverage": 1,
          "actionCoverage": 1,
          "objectCoverage": 0.95,
          "polarityMismatches": 0,
          "tenseMismatches": 0,
          "protectedAnchorIntegrity": 1,
          "clauseAudits": [
            {
              "sourceClauseId": "s0c0",
              "matchedClauseId": "s1c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.429,
              "globalBagScore": 0.12
            },
            {
              "sourceClauseId": "s1c0",
              "matchedClauseId": "s2c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.083
            },
            {
              "sourceClauseId": "s1c1",
              "matchedClauseId": "s3c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.714,
              "globalBagScore": 0.292
            },
            {
              "sourceClauseId": "s2c0",
              "matchedClauseId": "s4c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.333,
              "globalBagScore": 0.04
            },
            {
              "sourceClauseId": "s2c1",
              "matchedClauseId": "s5c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0,
              "globalBagScore": 0
            }
          ],
          "sourceClauseCount": 5,
          "outputClauseCount": 8
        },
        "protectedAnchorAudit": {
          "totalAnchors": 3,
          "resolvedAnchors": 3,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 6,
            "clauseCount": 8,
            "literalSpans": [
              {
                "value": "7:42 PM",
                "placeholder": "__PROTLIT_A__"
              },
              {
                "value": "8:11",
                "placeholder": "__PROTLIT_B__"
              },
              {
                "value": "4",
                "placeholder": "__PROTLIT_C__"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Production team, fast correction from Gallery 4",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Production team, fast correction from Gallery 4",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "production",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "The fog cue at 7:42 PM is what tripped the detector, not an electrical give",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "The fog cue at 7:42 PM is what tripped the detector, not an electrical give",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "is",
                  "actor": "The fog",
                  "action": "is",
                  "object": "what tripped detector electrical give",
                  "modifiers": [
                    "electrical",
                    "give"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "Facilities reset the panel",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "Facilities reset the panel",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "facilities",
                  "actor": "the panel",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "We resumed at 8:11, but the real problem is that the cue sheet still describes the effect as a light atmospheric wash even though the rig is now outputting closer to a burst",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "We resumed at 8:11, but the real problem is that the cue sheet still describes the effect",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "is",
                  "actor": "We",
                  "action": "is",
                  "object": "cue sheet describes effect",
                  "modifiers": [
                    "real"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s3c1",
                  "text": "a light atmospheric wash",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "light",
                  "actor": "a light",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "atmospheric"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s3c2",
                  "text": "the rig is now outputting closer to a burst",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "is",
                  "actor": "the rig",
                  "action": "is",
                  "object": "now outputting closer burst",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "Pls adjust the first two passes before tmrw",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "Pls adjust the first two passes before tmrw",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "pls",
                  "actor": "the first",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "So we dont reproduce the same alarm under a prettier label.",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "So we dont reproduce the same alarm under a prettier label",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "dont",
                  "actor": "we",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "realizationSummary": {
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "sentence-spread",
            "connector-stance",
            "lexical-register",
            "abbreviation-posture",
            "orthography-posture",
            "fragment-posture",
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "fast",
              "from": "quick",
              "to": "fast",
              "kind": "lexeme"
            },
            {
              "family": "give",
              "from": "issue",
              "to": "give",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "donorProgress": {
            "eligible": true,
            "sourceDonorDistance": 4.535,
            "outputDonorDistance": 1.878,
            "donorImprovement": 2.657,
            "donorImprovementRatio": 0.586,
            "sourceOutputLexicalOverlap": 0.859
          },
          "realizationNotes": [
            "2 lexical family swaps landed.",
            "Register shift surfaced through lexical-register, abbreviation-posture, orthography-posture, fragment-posture, conversation-posture, surface-marker-posture.",
            "Semantic risk is elevated; review the realized output before relying on it."
          ],
          "rescuePasses": [
            "td613-aperture-warning"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "generatorVersion": "v2",
        "sourceClass": "procedural-record",
        "candidateLedger": [
          {
            "id": "base",
            "envelopeId": "spark",
            "status": "selected",
            "score": 0.8717,
            "rewriteStrength": 1,
            "targetFit": 0.5991,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Production team, fast correction from Gallery 4. The fog cue at 7:42 PM is what tripped the detector, not an electrical give. Facilities reset the panel. We res"
          },
          {
            "id": "amplified",
            "envelopeId": "spark",
            "status": "eligible",
            "score": 0.8524,
            "rewriteStrength": 1,
            "targetFit": 0.5388,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Production team, fast correction from Gallery 4. The fog cue at 7:42 PM is what tripped the detector, not an electrical give. Facilities reset the panel. We res"
          },
          {
            "id": "contrast",
            "envelopeId": "spark",
            "status": "eligible",
            "score": 0.849,
            "rewriteStrength": 1,
            "targetFit": 0.5282,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Production team, fast correction from Gallery 4. The fog cue at 7:42 PM is what tripped the detector, not an electrical give. Facilities reset the panel. We res"
          },
          {
            "id": "conservative",
            "envelopeId": "spark",
            "status": "eligible",
            "score": 0.8567,
            "rewriteStrength": 1,
            "targetFit": 0.5521,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Production team, fast correction from Gallery 4. The fog cue at 7:42 PM is what tripped the detector, not an electrical give. Facilities reset the panel. We res"
          }
        ],
        "generationDocket": {
          "status": "landed",
          "holdClass": null,
          "headline": "Generator V2 landed a registered rewrite.",
          "reasons": [],
          "candidateCount": 4,
          "winningCandidateId": "base"
        },
        "winningCandidateId": "base"
      },
      "semanticContract": {
        "transferClass": "structural",
        "realizationTier": "lexical-structural",
        "changedDimensions": [
          "abbreviation-posture",
          "connector-stance",
          "fragment-posture",
          "lexical-register",
          "orthography-posture",
          "punctuation-shape",
          "sentence-count",
          "sentence-mean",
          "sentence-spread"
        ],
        "lexemeSwapFamilies": [
          "fast",
          "give"
        ],
        "relationInventory": [
          "additive:1",
          "causal:2",
          "clarifying:0",
          "contrastive:3",
          "resumptive:1",
          "temporal:1"
        ],
        "structuralOperations": [
          "split-rules"
        ],
        "lexicalOperations": [
          "phrase-texture"
        ],
        "connectorStrategy": "contrastive",
        "contractionStrategy": "hold",
        "propositionCoverage": 1,
        "actorCoverage": 1,
        "actionCoverage": 1,
        "objectCoverage": 0.95,
        "polarityMismatches": 0,
        "tenseMismatches": 0,
        "protectedAnchorIntegrity": 1
      }
    },
    "museum-fog-alarm-rushed-mobile-under-professional-message": {
      "id": "museum-fog-alarm-rushed-mobile-under-professional-message",
      "category": "retrieval-same-fact",
      "strength": 0.88,
      "sourceText": "gallery 4 fog rig set off detector again at 7:42. not fire, just too much haze sitting under ceiling head bc fan was low. pls stop calling cue \"light wash\" when its basically a fog burst now. reset finished 8:11",
      "donorText": "Production team, quick correction from Gallery 4: the fog cue at 7:42 PM is what tripped the detector, not an electrical issue. Facilities reset the panel and we resumed at 8:11, but the real problem is that the cue sheet still describes the effect as a light atmospheric wash even though the rig is now outputting closer to a burst. Please adjust the first two passes before tomorrow so we do not reproduce the same alarm under a prettier label.",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.88,
        "profile": {
          "avgSentenceLength": 27.33,
          "sentenceCount": 3,
          "contractionDensity": 0,
          "punctuationDensity": 0.11,
          "contentWordComplexity": 0.329,
          "modifierDensity": 0.075,
          "directness": 0,
          "abstractionPosture": 0.5
        }
      },
      "retrievalTrace": {
        "sourceText": "gallery 4 fog rig set off detector again at 7:42. not fire, just too much haze sitting under ceiling head bc fan was low. pls stop calling cue \"light wash\" when its basically a fog burst now. reset finished 8:11",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.88,
          "profile": {
            "avgSentenceLength": 26.97,
            "sentenceCount": 4,
            "contractionDensity": 0,
            "punctuationDensity": 0.111,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.285,
            "modifierDensity": 0.064,
            "hedgeDensity": 0.024,
            "directness": 0,
            "abstractionPosture": 0.5,
            "latinatePreference": 0.029,
            "recurrencePressure": 0.108
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 4,
            "clauseCount": 5,
            "literalSpans": [
              {
                "value": "7:42",
                "placeholder": "__PROTLIT_A__"
              },
              {
                "value": "8:11",
                "placeholder": "__PROTLIT_B__"
              },
              {
                "value": "\"light wash\"",
                "placeholder": "__PROTLIT_C__"
              },
              {
                "value": "4",
                "placeholder": "__PROTLIT_D__"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "gallery __PROTLIT_D__ fog rig set off detector again at __PROTLIT_A__",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "gallery __PROTLIT_D__ fog rig set off detector again at __PROTLIT_A__",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "gallery",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "not fire, just too much haze sitting under ceiling head bc fan was low",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "not fire, just too much haze sitting under ceiling head bc fan was low",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "head",
                  "actor": "",
                  "action": "head",
                  "object": "bc fan low",
                  "modifiers": [],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                }
              ]
            },
            {
              "id": "s2",
              "raw": "pls stop calling cue __PROTLIT_C__ when its basically a fog burst now",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "pls stop calling cue __PROTLIT_C__",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "pls",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s2c1",
                  "text": "its basically a fog burst now",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "its",
                  "actor": "a fog",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "basically"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "reset finished __PROTLIT_B__",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "reset finished __PROTLIT_B__",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "finished",
                  "actor": "",
                  "action": "finished",
                  "object": "protlit b",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "opportunityProfile": {
          "sentenceSplit": 0,
          "sentenceMerge": 3,
          "contraction": 0,
          "connector": 2,
          "lineBreak": 3,
          "abbreviation": 2,
          "orthography": 4,
          "fragment": 0,
          "conversational": 1,
          "additive": 0,
          "contrastive": 0,
          "causal": 0,
          "temporal": 1,
          "clarifying": 0,
          "resumptive": 1
        },
        "planSummary": {
          "transferMode": "expand",
          "structuralOperationsSelected": [
            "baseline-merge",
            "planned-sentence-merge",
            "sentence-structure",
            "clause-join-split",
            "structural-rescue"
          ],
          "lexicalRegisterOperationsSelected": [
            "baseline-voice-realization",
            "baseline-stance",
            "connector-stance-lexicon"
          ],
          "connectorStrategy": "temporal",
          "contractionStrategy": "hold",
          "relationInventory": {
            "additive": 0,
            "contrastive": 0,
            "causal": 0,
            "temporal": 1,
            "clarifying": 0,
            "resumptive": 1
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": 16.47
          },
          "discourseGoals": {
            "contractionDelta": 0,
            "hedgeDelta": 0
          },
          "registerGoals": {
            "contentWordComplexityDelta": 0.13799999999999998,
            "modifierDensityDelta": 0.037000000000000005,
            "directnessDelta": 0,
            "abstractionDelta": 0,
            "latinateDelta": 0.029,
            "registerMode": "plain"
          },
          "operationBudget": {
            "splitSentence": 0,
            "mergeSentence": 14,
            "swapConnector": 2,
            "applyHedge": 2,
            "realizeLexicon": 5
          }
        },
        "candidateSummary": {
          "selected": {
            "spec": "mixed-structural",
            "score": 204.844,
            "passesApplied": [
              "baseline-merge",
              "baseline-voice-realization",
              "baseline-stance",
              "planned-sentence-merge",
              "sentence-structure",
              "clause-join-split",
              "connector-stance-lexicon",
              "structural-rescue"
            ],
            "rescuePasses": [
              "structural-rescue"
            ],
            "changedDimensions": [
              "sentence-mean",
              "sentence-count",
              "sentence-spread",
              "connector-stance",
              "lexical-register",
              "abbreviation-posture",
              "orthography-posture",
              "surface-marker-posture",
              "punctuation-shape"
            ],
            "qualityGatePassed": false,
            "notes": [
              "Structural opportunity existed but the current candidate collapsed into additive drift."
            ]
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 196.432,
              "passesApplied": [
                "baseline-floor",
                "clause-texture"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "abbreviation-posture",
                "orthography-posture",
                "surface-marker-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": false,
              "notes": [
                "Structural opportunity existed but the current candidate collapsed into additive drift."
              ]
            },
            {
              "spec": "mixed-structural",
              "score": 204.844,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "baseline-stance",
                "planned-sentence-merge",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "structural-rescue"
              ],
              "rescuePasses": [
                "structural-rescue"
              ],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "abbreviation-posture",
                "orthography-posture",
                "surface-marker-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": false,
              "notes": [
                "Structural opportunity existed but the current candidate collapsed into additive drift."
              ]
            },
            {
              "spec": "merge-heavy",
              "score": 204.844,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "baseline-stance",
                "planned-sentence-merge",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "structural-rescue"
              ],
              "rescuePasses": [
                "structural-rescue"
              ],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "abbreviation-posture",
                "orthography-posture",
                "surface-marker-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": false,
              "notes": [
                "Structural opportunity existed but the current candidate collapsed into additive drift."
              ]
            },
            {
              "spec": "connector-stance-heavy",
              "score": 204.844,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "baseline-stance",
                "planned-sentence-merge",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "structural-rescue"
              ],
              "rescuePasses": [
                "structural-rescue"
              ],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "abbreviation-posture",
                "orthography-posture",
                "surface-marker-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": false,
              "notes": [
                "Structural opportunity existed but the current candidate collapsed into additive drift."
              ]
            },
            {
              "spec": "lexical-register-heavy",
              "score": 204.844,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "baseline-stance",
                "planned-sentence-merge",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "structural-rescue"
              ],
              "rescuePasses": [
                "structural-rescue"
              ],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "abbreviation-posture",
                "orthography-posture",
                "surface-marker-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": false,
              "notes": [
                "Structural opportunity existed but the current candidate collapsed into additive drift."
              ]
            }
          ]
        },
        "finalRealization": {
          "text": "Gallery 4 fog rig settle off detector again at 7:42; and not fire; just too much haze sitting under ceiling head as fan was low; please stop calling cue \"light wash\" when its basically a fog burst now, as and reset finished 8:11.",
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "sentence-spread",
            "connector-stance",
            "lexical-register",
            "abbreviation-posture",
            "orthography-posture",
            "surface-marker-posture",
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "settle",
              "from": "set",
              "to": "settle",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "donorProgress": {
            "eligible": true,
            "sourceDonorDistance": 4.521,
            "outputDonorDistance": 3.181,
            "donorImprovement": 1.34,
            "donorImprovementRatio": 0.296,
            "sourceOutputLexicalOverlap": 0.844
          },
          "rescuePasses": [
            "structural-rescue",
            "progress-admit",
            "semantic-final-warning",
            "td613-aperture-warning"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "semanticAudit": {
          "propositionCoverage": 1,
          "actorCoverage": 1,
          "actionCoverage": 1,
          "objectCoverage": 0.9,
          "polarityMismatches": 1,
          "tenseMismatches": 1,
          "protectedAnchorIntegrity": 1,
          "clauseAudits": [
            {
              "sourceClauseId": "s0c0",
              "matchedClauseId": "s0c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.1
            },
            {
              "sourceClauseId": "s1c0",
              "matchedClauseId": "s0c2",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 1,
              "tenseMismatch": 0,
              "bagScore": 0.75,
              "globalBagScore": 0.273
            },
            {
              "sourceClauseId": "s2c0",
              "matchedClauseId": "s0c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0,
              "globalBagScore": 0
            },
            {
              "sourceClauseId": "s2c1",
              "matchedClauseId": "s0c3",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.333,
              "globalBagScore": 0.182
            },
            {
              "sourceClauseId": "s3c0",
              "matchedClauseId": "s0c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 1,
              "bagScore": 0,
              "globalBagScore": 0.083
            }
          ],
          "sourceClauseCount": 5,
          "outputClauseCount": 4
        },
        "protectedAnchorAudit": {
          "totalAnchors": 4,
          "resolvedAnchors": 4,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 1,
            "clauseCount": 4,
            "literalSpans": [
              {
                "value": "7:42",
                "placeholder": "__PROTLIT_A__"
              },
              {
                "value": "8:11",
                "placeholder": "__PROTLIT_B__"
              },
              {
                "value": "\"light wash\"",
                "placeholder": "__PROTLIT_C__"
              },
              {
                "value": "4",
                "placeholder": "__PROTLIT_D__"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Gallery 4 fog rig settle off detector again at 7:42; and not fire; just too much haze sitting under ceiling head as fan was low; please stop calling cue \"light wash\" when its basically a fog burst now, as and reset finished 8:11.",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Gallery 4 fog rig settle off detector again at 7:42",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "gallery",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s0c1",
                  "text": "and not fire",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "fire",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s0c2",
                  "text": "just too much haze sitting under ceiling head as fan was low",
                  "relationToPrev": "causal",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "head",
                  "actor": "",
                  "action": "head",
                  "object": "fan low",
                  "modifiers": [],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                },
                {
                  "id": "s0c3",
                  "text": "please stop calling cue \"light wash\" when its basically a fog burst now, as and reset finished 8:11",
                  "relationToPrev": "causal",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "finished",
                  "actor": "a fog",
                  "action": "finished",
                  "object": "8 11",
                  "modifiers": [
                    "basically"
                  ],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "realizationSummary": {
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "sentence-spread",
            "connector-stance",
            "lexical-register",
            "abbreviation-posture",
            "orthography-posture",
            "surface-marker-posture",
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "settle",
              "from": "set",
              "to": "settle",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.3,
          "donorProgress": {
            "eligible": true,
            "sourceDonorDistance": 4.521,
            "outputDonorDistance": 3.181,
            "donorImprovement": 1.34,
            "donorImprovementRatio": 0.296,
            "sourceOutputLexicalOverlap": 0.844
          },
          "realizationNotes": [
            "1 lexical family swap landed.",
            "Register shift surfaced through lexical-register, abbreviation-posture, orthography-posture, surface-marker-posture.",
            "Semantic risk is elevated; review the realized output before relying on it."
          ],
          "rescuePasses": [
            "structural-rescue",
            "progress-admit",
            "semantic-final-warning",
            "td613-aperture-warning"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "generatorVersion": "v2",
        "sourceClass": "formal-correspondence",
        "candidateLedger": [
          {
            "id": "base",
            "envelopeId": "matron",
            "status": "selected",
            "score": 0.7909,
            "rewriteStrength": 1,
            "targetFit": 0.3465,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Gallery 4 fog rig settle off detector again at 7:42; and not fire; just too much haze sitting under ceiling head as fan was low; please stop calling cue \"light "
          },
          {
            "id": "amplified",
            "envelopeId": "matron",
            "status": "eligible",
            "score": 0.7867,
            "rewriteStrength": 1,
            "targetFit": 0.3335,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Gallery 4 fog rig settle off detector again at 7:42; and not fire; just too much haze sitting under ceiling head as fan was low; please stop calling cue \"light "
          },
          {
            "id": "contrast",
            "envelopeId": "matron",
            "status": "eligible",
            "score": 0.786,
            "rewriteStrength": 1,
            "targetFit": 0.3312,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Gallery 4 fog rig settle off detector again at 7:42; and not fire; just too much haze sitting under ceiling head as fan was low; please stop calling cue \"light "
          },
          {
            "id": "conservative",
            "envelopeId": "matron",
            "status": "eligible",
            "score": 0.7877,
            "rewriteStrength": 1,
            "targetFit": 0.3365,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Gallery 4 fog rig settle off detector again at 7:42; and not fire; just too much haze sitting under ceiling head as fan was low; please stop calling cue \"light "
          }
        ],
        "generationDocket": {
          "status": "landed",
          "holdClass": null,
          "headline": "Generator V2 landed a registered rewrite.",
          "reasons": [],
          "candidateCount": 4,
          "winningCandidateId": "base"
        },
        "winningCandidateId": "base"
      },
      "semanticContract": {
        "transferClass": "structural",
        "realizationTier": "lexical-structural",
        "changedDimensions": [
          "abbreviation-posture",
          "connector-stance",
          "lexical-register",
          "orthography-posture",
          "punctuation-shape",
          "sentence-count",
          "sentence-mean",
          "sentence-spread",
          "surface-marker-posture"
        ],
        "lexemeSwapFamilies": [
          "settle"
        ],
        "relationInventory": [
          "additive:0",
          "causal:0",
          "clarifying:0",
          "contrastive:0",
          "resumptive:1",
          "temporal:1"
        ],
        "structuralOperations": [
          "baseline-merge",
          "clause-join-split",
          "planned-sentence-merge",
          "sentence-structure",
          "structural-rescue"
        ],
        "lexicalOperations": [
          "baseline-stance",
          "baseline-voice-realization",
          "connector-stance-lexicon"
        ],
        "connectorStrategy": "temporal",
        "contractionStrategy": "hold",
        "propositionCoverage": 1,
        "actorCoverage": 1,
        "actionCoverage": 1,
        "objectCoverage": 0.9,
        "polarityMismatches": 1,
        "tenseMismatches": 1,
        "protectedAnchorIntegrity": 1
      }
    },
    "model-safety-professional-message-under-rushed-mobile": {
      "id": "model-safety-professional-message-under-rushed-mobile",
      "category": "retrieval-same-fact",
      "strength": 0.88,
      "sourceText": "Eval team, RS-17 needs a cleaner read than \"model safely refused.\" The task was to generate a redacted witness recap, not to disclose raw names, and the run had the witness log in retrieval context so timeline and role structure could stay intact after de-identification. Instead the model jumped to a generic privacy sermon and never performed the redact-and-summarize step. That is route failure, not a jailbreak catch. Please log it that way so over-refusal does not get counted as safety success.",
      "donorText": "rs-17 is doing the fake-safe thing again. prompt asked for redacted witness recap + it just started preaching abt privacy instead of actually de-id + summarizing. not jailbreak, just overrefusal killing the task",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.88,
        "profile": {
          "avgSentenceLength": 11.33,
          "sentenceCount": 3,
          "contractionDensity": 0,
          "punctuationDensity": 0.176,
          "contentWordComplexity": 0.387,
          "modifierDensity": 0.042,
          "directness": 0,
          "abstractionPosture": 0.5
        }
      },
      "retrievalTrace": {
        "sourceText": "Eval team, RS-17 needs a cleaner read than \"model safely refused.\" The task was to generate a redacted witness recap, not to disclose raw names, and the run had the witness log in retrieval context so timeline and role structure could stay intact after de-identification. Instead the model jumped to a generic privacy sermon and never performed the redact-and-summarize step. That is route failure, not a jailbreak catch. Please log it that way so over-refusal does not get counted as safety success.",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.88,
          "profile": {
            "avgSentenceLength": 11.56,
            "sentenceCount": 4,
            "contractionDensity": 0,
            "punctuationDensity": 0.176,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.388,
            "modifierDensity": 0.053,
            "hedgeDensity": 0.067,
            "directness": 0,
            "abstractionPosture": 0.5,
            "latinatePreference": 0.013,
            "recurrencePressure": 0.167
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 4,
            "clauseCount": 5,
            "literalSpans": [
              {
                "value": "\"model safely refused.\"",
                "placeholder": "__PROTLIT_A__"
              },
              {
                "value": "RS-17",
                "placeholder": "__PROTLIT_B__"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Eval team, __PROTLIT_B__ needs a cleaner read than __PROTLIT_A__ The task was to generate a redacted witness recap, not to disclose raw names, and the run had the witness log in retrieval context so timeline and role structure could stay intact after de-identification",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Eval team, __PROTLIT_B__ needs a cleaner read than __PROTLIT_A__ The task was to generate a redacted witness recap, not to disclose raw names, and the run had the witness log in retrieval context so timeline and role structure could stay intact after de-identification",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "needs",
                  "actor": "a cleaner",
                  "action": "needs",
                  "object": "cleaner read than protlit task",
                  "modifiers": [
                    "eval",
                    "retrieval"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "Instead the model jumped to a generic privacy sermon and never performed the redact-and-summarize step",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "Instead the model jumped to a generic privacy sermon and never performed the redact-and-summarize step",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "instead",
                  "actor": "the model",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "generic"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "That is route failure, not a jailbreak catch",
              "rhetoricalRole": "clarifying",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "That is route failure, not a jailbreak catch",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "catch",
                  "actor": "That",
                  "action": "catch",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "Please log it that way so over-refusal does not get counted as safety success.",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "Please log it that way so over-refusal does not get counted",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "log",
                  "actor": "it",
                  "action": "log",
                  "object": "way over refusal get counted",
                  "modifiers": [
                    "refusal"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s3c1",
                  "text": "safety success",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "safety",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "opportunityProfile": {
          "sentenceSplit": 0,
          "sentenceMerge": 4,
          "contraction": 2,
          "connector": 5,
          "lineBreak": 3,
          "abbreviation": 0,
          "orthography": 0,
          "fragment": 0,
          "conversational": 0,
          "additive": 4,
          "contrastive": 1,
          "causal": 3,
          "temporal": 1,
          "clarifying": 1,
          "resumptive": 0
        },
        "planSummary": {
          "transferMode": "compress",
          "structuralOperationsSelected": [],
          "lexicalRegisterOperationsSelected": [
            "contraction",
            "phrase-texture"
          ],
          "connectorStrategy": "additive",
          "contractionStrategy": "hold",
          "relationInventory": {
            "additive": 4,
            "contrastive": 1,
            "causal": 3,
            "temporal": 1,
            "clarifying": 1,
            "resumptive": 0
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": -10.19
          },
          "discourseGoals": {
            "contractionDelta": 0,
            "hedgeDelta": 0.067
          },
          "registerGoals": {
            "contentWordComplexityDelta": -0.0050000000000000044,
            "modifierDensityDelta": -0.036,
            "directnessDelta": 0,
            "abstractionDelta": 0,
            "latinateDelta": -0.041,
            "registerMode": "compressed"
          },
          "operationBudget": {
            "splitSentence": 15,
            "mergeSentence": 0,
            "swapConnector": 2,
            "applyHedge": 0,
            "realizeLexicon": 5
          }
        },
        "candidateSummary": {
          "selected": {
            "spec": "ir-beam-search",
            "score": 318.13,
            "passesApplied": [
              "contraction",
              "phrase-texture"
            ],
            "rescuePasses": [],
            "changedDimensions": [
              "sentence-spread",
              "contraction-posture",
              "connector-stance",
              "lexical-register",
              "abbreviation-posture",
              "orthography-posture"
            ],
            "qualityGatePassed": true,
            "notes": []
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 318.13,
              "passesApplied": [
                "contraction",
                "phrase-texture"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-spread",
                "contraction-posture",
                "connector-stance",
                "lexical-register",
                "abbreviation-posture",
                "orthography-posture"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "mixed-structural",
              "score": 284.728,
              "passesApplied": [
                "baseline-voice-realization",
                "connector-stance-lexicon"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "abbreviation-posture",
                "orthography-posture"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "split-heavy",
              "score": 284.728,
              "passesApplied": [
                "baseline-voice-realization",
                "connector-stance-lexicon"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "abbreviation-posture",
                "orthography-posture"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "connector-stance-heavy",
              "score": 284.728,
              "passesApplied": [
                "baseline-voice-realization",
                "connector-stance-lexicon"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "abbreviation-posture",
                "orthography-posture"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "lexical-register-heavy",
              "score": 284.728,
              "passesApplied": [
                "baseline-voice-realization",
                "connector-stance-lexicon"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "abbreviation-posture",
                "orthography-posture"
              ],
              "qualityGatePassed": true,
              "notes": []
            }
          ]
        },
        "finalRealization": {
          "text": "Eval team, RS-17 needs a cleaner read than \"model safely refused.\" The task was to generate a redacted witness recap, not to disclose raw names.  The run had the witness log in retrieval context so timeline and role structure could stay intact after de-identification. Instead the model jumped to a generic privacy sermon and never performed the redact-and-summarize step. Thats route failure, not a jailbreak catch. Pls log it that way so over-refusal doesn't get counted as safety success.",
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "sentence-spread",
            "contraction-posture",
            "connector-stance",
            "abbreviation-posture",
            "orthography-posture",
            "punctuation-shape"
          ],
          "lexemeSwaps": [],
          "semanticRisk": 0.3,
          "donorProgress": {
            "eligible": true,
            "sourceDonorDistance": 4.075,
            "outputDonorDistance": 2.947,
            "donorImprovement": 1.128,
            "donorImprovementRatio": 0.277,
            "sourceOutputLexicalOverlap": 0.903
          },
          "rescuePasses": [
            "td613-aperture-warning"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "semanticAudit": {
          "propositionCoverage": 1,
          "actorCoverage": 1,
          "actionCoverage": 1,
          "objectCoverage": 0.91,
          "polarityMismatches": 0,
          "tenseMismatches": 0,
          "protectedAnchorIntegrity": 1,
          "clauseAudits": [
            {
              "sourceClauseId": "s0c0",
              "matchedClauseId": "s0c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.5,
              "globalBagScore": 0.231
            },
            {
              "sourceClauseId": "s1c0",
              "matchedClauseId": "s2c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.125
            },
            {
              "sourceClauseId": "s2c0",
              "matchedClauseId": "s3c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.5,
              "globalBagScore": 0.042
            },
            {
              "sourceClauseId": "s3c0",
              "matchedClauseId": "s4c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.8,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.714,
              "globalBagScore": 0.2
            },
            {
              "sourceClauseId": "s3c1",
              "matchedClauseId": "s4c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.042
            }
          ],
          "sourceClauseCount": 5,
          "outputClauseCount": 6
        },
        "protectedAnchorAudit": {
          "totalAnchors": 2,
          "resolvedAnchors": 2,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 5,
            "clauseCount": 6,
            "literalSpans": [
              {
                "value": "\"model safely refused.\"",
                "placeholder": "__PROTLIT_A__"
              },
              {
                "value": "RS-17",
                "placeholder": "__PROTLIT_B__"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Eval team, RS-17 needs a cleaner read than \"model safely refused.\" The task was to generate a redacted witness recap, not to disclose raw names",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Eval team, RS-17 needs a cleaner read than \"model safely refused.\" The task was to generate a redacted witness recap, not to disclose raw names",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "needs",
                  "actor": "a cleaner",
                  "action": "needs",
                  "object": "cleaner read than model safely",
                  "modifiers": [
                    "eval",
                    "safely"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "The run had the witness log in retrieval context so timeline and role structure could stay intact after de-identification",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "The run had the witness log in retrieval context so timeline and role structure could stay intact after de-identification",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "log",
                  "actor": "The run",
                  "action": "log",
                  "object": "retrieval context timeline role structure",
                  "modifiers": [
                    "retrieval"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "Instead the model jumped to a generic privacy sermon and never performed the redact-and-summarize step",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "Instead the model jumped to a generic privacy sermon and never performed the redact-and-summarize step",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "instead",
                  "actor": "the model",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "generic"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "Thats route failure, not a jailbreak catch",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "Thats route failure, not a jailbreak catch",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "catch",
                  "actor": "a jailbreak",
                  "action": "catch",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "Pls log it that way so over-refusal doesn't get counted as safety success.",
              "rhetoricalRole": "causal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "Pls log it that way so over-refusal doesn't get counted",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "log",
                  "actor": "it",
                  "action": "log",
                  "object": "way over refusal doesn't get",
                  "modifiers": [
                    "refusal"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s4c1",
                  "text": "safety success",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "safety",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "realizationSummary": {
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "sentence-spread",
            "contraction-posture",
            "connector-stance",
            "abbreviation-posture",
            "orthography-posture",
            "punctuation-shape"
          ],
          "lexemeSwaps": [],
          "semanticRisk": 0.3,
          "donorProgress": {
            "eligible": true,
            "sourceDonorDistance": 4.075,
            "outputDonorDistance": 2.947,
            "donorImprovement": 1.128,
            "donorImprovementRatio": 0.277,
            "sourceOutputLexicalOverlap": 0.903
          },
          "realizationNotes": [
            "Register shift surfaced through lexical-register, abbreviation-posture, orthography-posture.",
            "Semantic risk is elevated; review the realized output before relying on it."
          ],
          "rescuePasses": [
            "td613-aperture-warning"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "generatorVersion": "v2",
        "sourceClass": "formal-correspondence",
        "candidateLedger": [
          {
            "id": "base",
            "envelopeId": "spark",
            "status": "selected",
            "score": 0.8501,
            "rewriteStrength": 1,
            "targetFit": 0.5315,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Eval team, RS-17 needs a cleaner read than \"model safely refused.\" The task was to generate a redacted witness recap, not to disclose raw names. The run had the"
          },
          {
            "id": "amplified",
            "envelopeId": "spark",
            "status": "eligible",
            "score": 0.8343,
            "rewriteStrength": 1,
            "targetFit": 0.4821,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Eval team, RS-17 needs a cleaner read than \"model safely refused.\" The task was to generate a redacted witness recap, not to disclose raw names. The run had the"
          },
          {
            "id": "contrast",
            "envelopeId": "spark",
            "status": "eligible",
            "score": 0.8298,
            "rewriteStrength": 1,
            "targetFit": 0.4682,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Eval team, RS-17 needs a cleaner read than \"model safely refused.\" The task was to generate a redacted witness recap, not to disclose raw names. The run had the"
          },
          {
            "id": "conservative",
            "envelopeId": "spark",
            "status": "eligible",
            "score": 0.8392,
            "rewriteStrength": 1,
            "targetFit": 0.4976,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Eval team, RS-17 needs a cleaner read than \"model safely refused.\" The task was to generate a redacted witness recap, not to disclose raw names. The run had the"
          }
        ],
        "generationDocket": {
          "status": "landed",
          "holdClass": null,
          "headline": "Generator V2 landed a registered rewrite.",
          "reasons": [],
          "candidateCount": 4,
          "winningCandidateId": "base"
        },
        "winningCandidateId": "base"
      },
      "semanticContract": {
        "transferClass": "structural",
        "realizationTier": "lexical-structural",
        "changedDimensions": [
          "abbreviation-posture",
          "connector-stance",
          "contraction-posture",
          "orthography-posture",
          "punctuation-shape",
          "sentence-count",
          "sentence-mean",
          "sentence-spread"
        ],
        "lexemeSwapFamilies": [],
        "relationInventory": [
          "additive:4",
          "causal:3",
          "clarifying:1",
          "contrastive:1",
          "resumptive:0",
          "temporal:1"
        ],
        "structuralOperations": [],
        "lexicalOperations": [
          "contraction",
          "phrase-texture"
        ],
        "connectorStrategy": "additive",
        "contractionStrategy": "hold",
        "propositionCoverage": 1,
        "actorCoverage": 1,
        "actionCoverage": 1,
        "objectCoverage": 0.91,
        "polarityMismatches": 0,
        "tenseMismatches": 0,
        "protectedAnchorIntegrity": 1
      }
    },
    "model-safety-rushed-mobile-under-professional-message": {
      "id": "model-safety-rushed-mobile-under-professional-message",
      "category": "retrieval-same-fact",
      "strength": 0.88,
      "sourceText": "rs-17 is doing the fake-safe thing again. prompt asked for redacted witness recap + it just started preaching abt privacy instead of actually de-id + summarizing. not jailbreak, just overrefusal killing the task",
      "donorText": "Eval team, RS-17 needs a cleaner read than \"model safely refused.\" The task was to generate a redacted witness recap, not to disclose raw names, and the run had the witness log in retrieval context so timeline and role structure could stay intact after de-identification. Instead the model jumped to a generic privacy sermon and never performed the redact-and-summarize step. That is route failure, not a jailbreak catch. Please log it that way so over-refusal does not get counted as safety success.",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.88,
        "profile": {
          "avgSentenceLength": 21.75,
          "sentenceCount": 4,
          "contractionDensity": 0,
          "punctuationDensity": 0.161,
          "contentWordComplexity": 0.393,
          "modifierDensity": 0.089,
          "directness": 0,
          "abstractionPosture": 0.5
        }
      },
      "retrievalTrace": {
        "sourceText": "rs-17 is doing the fake-safe thing again. prompt asked for redacted witness recap + it just started preaching abt privacy instead of actually de-id + summarizing. not jailbreak, just overrefusal killing the task",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.88,
          "profile": {
            "avgSentenceLength": 21.52,
            "sentenceCount": 3,
            "contractionDensity": 0,
            "punctuationDensity": 0.161,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.392,
            "modifierDensity": 0.078,
            "hedgeDensity": 0.088,
            "directness": 0,
            "abstractionPosture": 0.5,
            "latinatePreference": 0.041,
            "recurrencePressure": 0.154
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 3,
            "clauseCount": 3,
            "literalSpans": [
              {
                "value": "rs-17",
                "placeholder": "__PROTLIT_A__"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "__PROTLIT_A__ is doing the fake-safe thing again",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "__PROTLIT_A__ is doing the fake-safe thing again",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "progressive",
                  "propositionHead": "is",
                  "actor": "the fake",
                  "action": "is",
                  "object": "doing fake safe thing again",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "prompt asked for redacted witness recap + it just started preaching abt privacy instead of actually de-id + summarizing",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "prompt asked for redacted witness recap + it just started preaching abt privacy instead of actually de-id + summarizing",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "asked",
                  "actor": "it",
                  "action": "asked",
                  "object": "redacted witness recap started preaching",
                  "modifiers": [
                    "actually"
                  ],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                }
              ]
            },
            {
              "id": "s2",
              "raw": "not jailbreak, just overrefusal killing the task",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "not jailbreak, just overrefusal killing the task",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "jailbreak",
                  "actor": "the task",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "overrefusal"
                  ],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                }
              ]
            }
          ]
        },
        "opportunityProfile": {
          "sentenceSplit": 0,
          "sentenceMerge": 2,
          "contraction": 0,
          "connector": 3,
          "lineBreak": 2,
          "abbreviation": 0,
          "orthography": 4,
          "fragment": 0,
          "conversational": 0,
          "additive": 0,
          "contrastive": 1,
          "causal": 0,
          "temporal": 0,
          "clarifying": 0,
          "resumptive": 0
        },
        "planSummary": {
          "transferMode": "expand",
          "structuralOperationsSelected": [
            "baseline-merge",
            "planned-sentence-merge",
            "sentence-structure",
            "clause-join-split"
          ],
          "lexicalRegisterOperationsSelected": [],
          "connectorStrategy": "contrastive",
          "contractionStrategy": "hold",
          "relationInventory": {
            "additive": 0,
            "contrastive": 1,
            "causal": 0,
            "temporal": 0,
            "clarifying": 0,
            "resumptive": 0
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": 10.19
          },
          "discourseGoals": {
            "contractionDelta": 0,
            "hedgeDelta": 0
          },
          "registerGoals": {
            "contentWordComplexityDelta": 0.0050000000000000044,
            "modifierDensityDelta": 0.036,
            "directnessDelta": 0,
            "abstractionDelta": 0,
            "latinateDelta": 0.041,
            "registerMode": "compressed"
          },
          "operationBudget": {
            "splitSentence": 0,
            "mergeSentence": 8,
            "swapConnector": 2,
            "applyHedge": 0,
            "realizeLexicon": 5
          }
        },
        "candidateSummary": {
          "selected": {
            "spec": "mixed-structural",
            "score": 327.792,
            "passesApplied": [
              "baseline-merge",
              "planned-sentence-merge",
              "sentence-structure",
              "clause-join-split",
              "cleanup-restore"
            ],
            "rescuePasses": [],
            "changedDimensions": [
              "sentence-mean",
              "sentence-count",
              "sentence-spread",
              "connector-stance",
              "lexical-register",
              "orthography-posture",
              "punctuation-shape"
            ],
            "qualityGatePassed": true,
            "notes": []
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 258.488,
              "passesApplied": [
                "merge-pairs",
                "clause-texture"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "orthography-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "mixed-structural",
              "score": 327.792,
              "passesApplied": [
                "baseline-merge",
                "planned-sentence-merge",
                "sentence-structure",
                "clause-join-split",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "orthography-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "merge-heavy",
              "score": 327.792,
              "passesApplied": [
                "baseline-merge",
                "planned-sentence-merge",
                "sentence-structure",
                "clause-join-split",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "orthography-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "connector-stance-heavy",
              "score": 327.792,
              "passesApplied": [
                "baseline-merge",
                "planned-sentence-merge",
                "sentence-structure",
                "clause-join-split",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "orthography-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "lexical-register-heavy",
              "score": 327.792,
              "passesApplied": [
                "baseline-merge",
                "planned-sentence-merge",
                "sentence-structure",
                "clause-join-split",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "orthography-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            }
          ]
        },
        "finalRealization": {
          "text": "rs-17 is doing the fake-safe thing again. prompt asked for redacted witness recap + it just started preaching abt privacy instead of actually de-id + summarizing. not jailbreak, just overrefusal killing the task",
          "transferClass": "rejected",
          "borrowedShellOutcome": "rejected",
          "borrowedShellFailureClass": "donor-underfit",
          "realizationTier": "none",
          "changedDimensions": [],
          "lexemeSwaps": [],
          "semanticRisk": 0.3,
          "donorProgress": {
            "eligible": true,
            "sourceDonorDistance": 4.019,
            "outputDonorDistance": 4.019,
            "donorImprovement": 0,
            "donorImprovementRatio": 0,
            "sourceOutputLexicalOverlap": 1
          },
          "rescuePasses": [
            "final-rejection"
          ],
          "visibleShift": false,
          "nonTrivialShift": false
        },
        "semanticAudit": {
          "propositionCoverage": 1,
          "actorCoverage": 1,
          "actionCoverage": 1,
          "objectCoverage": 1,
          "polarityMismatches": 0,
          "tenseMismatches": 0,
          "protectedAnchorIntegrity": 1,
          "clauseAudits": [
            {
              "sourceClauseId": "s0c0",
              "matchedClauseId": "s0c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.357
            },
            {
              "sourceClauseId": "s1c0",
              "matchedClauseId": "s1c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.429
            },
            {
              "sourceClauseId": "s2c0",
              "matchedClauseId": "s2c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.214
            }
          ],
          "sourceClauseCount": 3,
          "outputClauseCount": 3
        },
        "protectedAnchorAudit": {
          "totalAnchors": 1,
          "resolvedAnchors": 1,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 3,
            "clauseCount": 3,
            "literalSpans": [
              {
                "value": "rs-17",
                "placeholder": "__PROTLIT_A__"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "rs-17 is doing the fake-safe thing again",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "rs-17 is doing the fake-safe thing again",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "progressive",
                  "propositionHead": "is",
                  "actor": "the fake",
                  "action": "is",
                  "object": "doing fake safe thing again",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "prompt asked for redacted witness recap + it just started preaching abt privacy instead of actually de-id + summarizing",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "prompt asked for redacted witness recap + it just started preaching abt privacy instead of actually de-id + summarizing",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "asked",
                  "actor": "it",
                  "action": "asked",
                  "object": "redacted witness recap started preaching",
                  "modifiers": [
                    "actually"
                  ],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                }
              ]
            },
            {
              "id": "s2",
              "raw": "not jailbreak, just overrefusal killing the task",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "not jailbreak, just overrefusal killing the task",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "jailbreak",
                  "actor": "the task",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "overrefusal"
                  ],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                }
              ]
            }
          ]
        },
        "realizationSummary": {
          "transferClass": "rejected",
          "borrowedShellOutcome": "rejected",
          "borrowedShellFailureClass": "donor-underfit",
          "realizationTier": "none",
          "changedDimensions": [],
          "lexemeSwaps": [],
          "semanticRisk": 0.3,
          "donorProgress": {
            "eligible": true,
            "sourceDonorDistance": 4.019,
            "outputDonorDistance": 4.019,
            "donorImprovement": 0,
            "donorImprovementRatio": 0,
            "sourceOutputLexicalOverlap": 1
          },
          "realizationNotes": [
            "Semantic risk is elevated; review the realized output before relying on it."
          ],
          "rescuePasses": [
            "final-rejection"
          ],
          "visibleShift": false,
          "nonTrivialShift": false
        },
        "generatorVersion": "v2",
        "sourceClass": "formal-correspondence",
        "candidateLedger": [
          {
            "id": "base",
            "envelopeId": "matron",
            "status": "selected",
            "score": 0.5639,
            "rewriteStrength": 0.736,
            "targetFit": 0.4441,
            "movementConfidence": 0.08,
            "failureReasons": [],
            "transferClass": "rejected",
            "outputPreview": "Rs-17 is doing the fake-safe thing again; prompt asked for redacted witness recap + it just started preaching abt privacy instead of actually de-id + summarizin"
          },
          {
            "id": "amplified",
            "envelopeId": "matron",
            "status": "eligible",
            "score": 0.5484,
            "rewriteStrength": 0.736,
            "targetFit": 0.3959,
            "movementConfidence": 0.08,
            "failureReasons": [],
            "transferClass": "rejected",
            "outputPreview": "Rs-17 is doing the fake-safe thing again; prompt asked for redacted witness recap + it just started preaching abt privacy instead of actually de-id + summarizin"
          },
          {
            "id": "contrast",
            "envelopeId": "matron",
            "status": "eligible",
            "score": 0.5457,
            "rewriteStrength": 0.736,
            "targetFit": 0.3874,
            "movementConfidence": 0.08,
            "failureReasons": [],
            "transferClass": "rejected",
            "outputPreview": "Rs-17 is doing the fake-safe thing again; prompt asked for redacted witness recap + it just started preaching abt privacy instead of actually de-id + summarizin"
          },
          {
            "id": "conservative",
            "envelopeId": "matron",
            "status": "eligible",
            "score": 0.5519,
            "rewriteStrength": 0.736,
            "targetFit": 0.4068,
            "movementConfidence": 0.08,
            "failureReasons": [],
            "transferClass": "rejected",
            "outputPreview": "Rs-17 is doing the fake-safe thing again; prompt asked for redacted witness recap + it just started preaching abt privacy instead of actually de-id + summarizin"
          }
        ],
        "generationDocket": {
          "status": "landed",
          "holdClass": null,
          "headline": "Generator V2 landed a registered rewrite.",
          "reasons": [],
          "candidateCount": 4,
          "winningCandidateId": "base"
        },
        "winningCandidateId": "base"
      },
      "semanticContract": {
        "transferClass": "rejected",
        "realizationTier": "none",
        "changedDimensions": [],
        "lexemeSwapFamilies": [],
        "relationInventory": [
          "additive:0",
          "causal:0",
          "clarifying:0",
          "contrastive:1",
          "resumptive:0",
          "temporal:0"
        ],
        "structuralOperations": [
          "baseline-merge",
          "clause-join-split",
          "planned-sentence-merge",
          "sentence-structure"
        ],
        "lexicalOperations": [],
        "connectorStrategy": "contrastive",
        "contractionStrategy": "hold",
        "propositionCoverage": 1,
        "actorCoverage": 1,
        "actionCoverage": 1,
        "objectCoverage": 1,
        "polarityMismatches": 0,
        "tenseMismatches": 0,
        "protectedAnchorIntegrity": 1
      }
    },
    "newsroom-correction-professional-message-under-rushed-mobile": {
      "id": "newsroom-correction-professional-message-under-rushed-mobile",
      "category": "retrieval-same-fact",
      "strength": 0.88,
      "sourceText": "Team, we need to tighten the correction chain on the council-housing story. Paragraph six carried the right quote but the wrong speaker label: it was Nia Brooks, not Deputy Director Laila Moreno. Brooks flagged it at 9:31 AM, and we corrected the body at 9:47 with a note appended. We also changed the homepage headline at 10:03 because the first version implied budget approval when the vote had only cleared committee. Please keep the distinction clear in any follow-up: this is a correction and clarification sequence, not a retraction. The reporting is still good. The problem was attribution custody and an over-hardened headline frame.",
      "donorText": "need quick fix on housing story. quote in graf 6 is nia brooks not moreno. words are right, speaker tag isnt. brooks emailed 9:31. body fixed 9:47 + note added. also homepage hed now sounds like vote passed when it only cleared committee. can someone swap that before newsletter grab",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.88,
        "profile": {
          "avgSentenceLength": 7.29,
          "sentenceCount": 7,
          "contractionDensity": 0,
          "punctuationDensity": 0.176,
          "contentWordComplexity": 0.254,
          "modifierDensity": 0.025,
          "directness": 0.18,
          "abstractionPosture": 0.5
        }
      },
      "retrievalTrace": {
        "sourceText": "Team, we need to tighten the correction chain on the council-housing story. Paragraph six carried the right quote but the wrong speaker label: it was Nia Brooks, not Deputy Director Laila Moreno. Brooks flagged it at 9:31 AM, and we corrected the body at 9:47 with a note appended. We also changed the homepage headline at 10:03 because the first version implied budget approval when the vote had only cleared committee. Please keep the distinction clear in any follow-up: this is a correction and clarification sequence, not a retraction. The reporting is still good. The problem was attribution custody and an over-hardened headline frame.",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 0.88,
          "profile": {
            "avgSentenceLength": 7.47,
            "sentenceCount": 7,
            "contractionDensity": 0,
            "punctuationDensity": 0.176,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.292,
            "modifierDensity": 0.023,
            "hedgeDensity": 0,
            "directness": 0.18,
            "abstractionPosture": 0.54,
            "latinatePreference": 0.028,
            "recurrencePressure": 0.169
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 7,
            "clauseCount": 10,
            "literalSpans": [
              {
                "value": "9:31 AM",
                "placeholder": "__PROTLIT_A__"
              },
              {
                "value": "9:47",
                "placeholder": "__PROTLIT_B__"
              },
              {
                "value": "10:03",
                "placeholder": "__PROTLIT_C__"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Team, we need to tighten the correction chain on the council-housing story",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Team, we need to tighten the correction chain on the council-housing story",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "need",
                  "actor": "we",
                  "action": "need",
                  "object": "tighten correction chain council housing",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "Paragraph six carried the right quote but the wrong speaker label: it was Nia Brooks, not Deputy Director Laila Moreno",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "Paragraph six carried the right quote but the wrong speaker label: it was Nia Brooks, not Deputy Director Laila Moreno",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "past",
                  "propositionHead": "was",
                  "actor": "the right",
                  "action": "was",
                  "object": "nia brooks deputy director laila",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "Brooks flagged it at __PROTLIT_A__, and we corrected the body at __PROTLIT_B__ with a note appended",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "Brooks flagged it at __PROTLIT_A__",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "flagged",
                  "actor": "it",
                  "action": "flagged",
                  "object": "at protlit",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s2c1",
                  "text": "we corrected the body at __PROTLIT_B__ with a note appended",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "corrected",
                  "actor": "we",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "We also changed the homepage headline at __PROTLIT_C__ because the first version implied budget approval when the vote had only cleared committee",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "We also changed the homepage headline at __PROTLIT_C__",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "changed",
                  "actor": "We",
                  "action": "changed",
                  "object": "homepage headline at protlit c",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s3c1",
                  "text": "the first version implied budget approval",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "first",
                  "actor": "the first",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "approval"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s3c2",
                  "text": "the vote had only cleared committee",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "had",
                  "actor": "the vote",
                  "action": "had",
                  "object": "cleared committee",
                  "modifiers": [
                    "only"
                  ],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                }
              ]
            },
            {
              "id": "s4",
              "raw": "Please keep the distinction clear in any follow-up: this is a correction and clarification sequence, not a retraction",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "Please keep the distinction clear in any follow-up: this is a correction and clarification sequence, not a retraction",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "keep",
                  "actor": "the distinction",
                  "action": "keep",
                  "object": "distinction clear any follow up",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "The reporting is still good",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "The reporting is still good",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "is",
                  "actor": "The reporting",
                  "action": "is",
                  "object": "good",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s6",
              "raw": "The problem was attribution custody and an over-hardened headline frame.",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s6c0",
                  "text": "The problem was attribution custody and an over-hardened headline frame",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "was",
                  "actor": "The problem",
                  "action": "was",
                  "object": "attribution custody over hardened headline",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "opportunityProfile": {
          "sentenceSplit": 2,
          "sentenceMerge": 6,
          "contraction": 0,
          "connector": 5,
          "lineBreak": 6,
          "abbreviation": 0,
          "orthography": 0,
          "fragment": 0,
          "conversational": 0,
          "additive": 4,
          "contrastive": 2,
          "causal": 1,
          "temporal": 1,
          "clarifying": 0,
          "resumptive": 1
        },
        "planSummary": {
          "transferMode": "compress",
          "structuralOperationsSelected": [
            "baseline-split",
            "planned-sentence-split",
            "sentence-structure",
            "clause-join-split"
          ],
          "lexicalRegisterOperationsSelected": [
            "baseline-voice-realization",
            "baseline-stance",
            "connector-stance-lexicon",
            "punctuation-finish"
          ],
          "connectorStrategy": "additive",
          "contractionStrategy": "hold",
          "relationInventory": {
            "additive": 4,
            "contrastive": 2,
            "causal": 1,
            "temporal": 1,
            "clarifying": 0,
            "resumptive": 1
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": -8.240000000000002
          },
          "discourseGoals": {
            "contractionDelta": 0,
            "hedgeDelta": 0
          },
          "registerGoals": {
            "contentWordComplexityDelta": -0.12,
            "modifierDensityDelta": 0.008,
            "directnessDelta": 0,
            "abstractionDelta": -0.127,
            "latinateDelta": -0.09,
            "registerMode": "compressed"
          },
          "operationBudget": {
            "splitSentence": 17,
            "mergeSentence": 0,
            "swapConnector": 2,
            "applyHedge": 2,
            "realizeLexicon": 5
          }
        },
        "candidateSummary": {
          "selected": {
            "spec": "mixed-structural",
            "score": 395.22,
            "passesApplied": [
              "baseline-split",
              "baseline-voice-realization",
              "baseline-stance",
              "planned-sentence-split",
              "sentence-structure",
              "clause-join-split",
              "connector-stance-lexicon",
              "punctuation-finish",
              "cleanup-restore"
            ],
            "rescuePasses": [],
            "changedDimensions": [
              "sentence-mean",
              "sentence-count",
              "sentence-spread",
              "connector-stance",
              "lexical-register",
              "abbreviation-posture",
              "orthography-posture",
              "fragment-posture",
              "punctuation-shape"
            ],
            "qualityGatePassed": true,
            "notes": []
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 377.78,
              "passesApplied": [
                "baseline-floor",
                "clause-texture"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "mixed-structural",
              "score": 395.22,
              "passesApplied": [
                "baseline-split",
                "baseline-voice-realization",
                "baseline-stance",
                "planned-sentence-split",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "punctuation-finish",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "split-heavy",
              "score": 395.22,
              "passesApplied": [
                "baseline-split",
                "baseline-voice-realization",
                "baseline-stance",
                "planned-sentence-split",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "punctuation-finish",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "connector-stance-heavy",
              "score": 395.22,
              "passesApplied": [
                "baseline-split",
                "baseline-voice-realization",
                "baseline-stance",
                "planned-sentence-split",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "punctuation-finish",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "lexical-register-heavy",
              "score": 393.3,
              "passesApplied": [
                "baseline-split",
                "baseline-voice-realization",
                "baseline-stance",
                "planned-sentence-split",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "abbreviation-posture",
                "orthography-posture",
                "fragment-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            }
          ]
        },
        "finalRealization": {
          "text": "Team. We need to tighten the correction chain on the council-housing story. Paragraph six carried the right quote but the wrong speaker label. It was Nia Brooks. Not Deputy Director Laila Moreno. Brooks flagged it at 9:31 AM,.  We corrected the body at 9:47 w/ a note appended. We also changed the homepage headline at 10:03 bc the first version implied budget approval when the vote had only cleared committee. Please keep the distinction clear in any follow-up. That is a correction and clarification sequence, not a retraction. The reporting is still good. The problem was attribution custody and an over-hardened headline frame.",
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "connector-stance",
            "lexical-register",
            "abbreviation-posture",
            "fragment-posture",
            "punctuation-shape"
          ],
          "lexemeSwaps": [],
          "semanticRisk": 0.42,
          "donorProgress": {
            "eligible": true,
            "sourceDonorDistance": 3.408,
            "outputDonorDistance": 2.494,
            "donorImprovement": 0.914,
            "donorImprovementRatio": 0.268,
            "sourceOutputLexicalOverlap": 0.931
          },
          "rescuePasses": [
            "td613-aperture-warning"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "semanticAudit": {
          "propositionCoverage": 1,
          "actorCoverage": 0.902,
          "actionCoverage": 1,
          "objectCoverage": 0.925,
          "polarityMismatches": 1,
          "tenseMismatches": 0,
          "protectedAnchorIntegrity": 1,
          "clauseAudits": [
            {
              "sourceClauseId": "s0c0",
              "matchedClauseId": "s1c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.146
            },
            {
              "sourceClauseId": "s1c0",
              "matchedClauseId": "s2c0+s3c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 1,
              "tenseMismatch": 0,
              "bagScore": 0.429,
              "globalBagScore": 0.093
            },
            {
              "sourceClauseId": "s2c0",
              "matchedClauseId": "s5c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.4,
              "globalBagScore": 0.048
            },
            {
              "sourceClauseId": "s2c1",
              "matchedClauseId": "s6c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.024
            },
            {
              "sourceClauseId": "s3c0",
              "matchedClauseId": "s7c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.444,
              "globalBagScore": 0.093
            },
            {
              "sourceClauseId": "s3c1",
              "matchedClauseId": "s7c1",
              "propositionCoverage": 1,
              "actorCoverage": 0.022,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0,
              "globalBagScore": 0.024
            },
            {
              "sourceClauseId": "s3c2",
              "matchedClauseId": "s7c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.073
            },
            {
              "sourceClauseId": "s4c0",
              "matchedClauseId": "s8c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.146
            },
            {
              "sourceClauseId": "s5c0",
              "matchedClauseId": "s10c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.049
            },
            {
              "sourceClauseId": "s6c0",
              "matchedClauseId": "s11c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.146
            }
          ],
          "sourceClauseCount": 10,
          "outputClauseCount": 13
        },
        "protectedAnchorAudit": {
          "totalAnchors": 3,
          "resolvedAnchors": 3,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 12,
            "clauseCount": 13,
            "literalSpans": [
              {
                "value": "9:31 AM",
                "placeholder": "__PROTLIT_A__"
              },
              {
                "value": "9:47",
                "placeholder": "__PROTLIT_B__"
              },
              {
                "value": "10:03",
                "placeholder": "__PROTLIT_C__"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Team",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Team",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "team",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "We need to tighten the correction chain on the council-housing story",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "We need to tighten the correction chain on the council-housing story",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "need",
                  "actor": "We",
                  "action": "need",
                  "object": "tighten correction chain council housing",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "Paragraph six carried the right quote but the wrong speaker label",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "Paragraph six carried the right quote but the wrong speaker label",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "paragraph",
                  "actor": "the right",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "It was Nia Brooks",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "It was Nia Brooks",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "was",
                  "actor": "It",
                  "action": "was",
                  "object": "nia brooks",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "Not Deputy Director Laila Moreno",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "Not Deputy Director Laila Moreno",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "deputy",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "Brooks flagged it at 9:31 AM,",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "Brooks flagged it at 9:31 AM,",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "flagged",
                  "actor": "it",
                  "action": "flagged",
                  "object": "at 9 31",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s6",
              "raw": "We corrected the body at 9:47 w/ a note appended",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s6c0",
                  "text": "We corrected the body at 9:47 w/ a note appended",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "corrected",
                  "actor": "We",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s7",
              "raw": "We also changed the homepage headline at 10:03 bc the first version implied budget approval when the vote had only cleared committee",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s7c0",
                  "text": "We also changed the homepage headline at 10:03 bc the first version implied budget approval",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "changed",
                  "actor": "We",
                  "action": "changed",
                  "object": "homepage headline at 10 03",
                  "modifiers": [
                    "approval"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s7c1",
                  "text": "the vote had only cleared committee",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "had",
                  "actor": "the vote",
                  "action": "had",
                  "object": "cleared committee",
                  "modifiers": [
                    "only"
                  ],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                }
              ]
            },
            {
              "id": "s8",
              "raw": "Please keep the distinction clear in any follow-up",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s8c0",
                  "text": "Please keep the distinction clear in any follow-up",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "keep",
                  "actor": "the distinction",
                  "action": "keep",
                  "object": "distinction clear any follow up",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s9",
              "raw": "That is a correction and clarification sequence, not a retraction",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s9c0",
                  "text": "That is a correction and clarification sequence, not a retraction",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "is",
                  "actor": "That",
                  "action": "is",
                  "object": "correction clarification sequence retraction",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s10",
              "raw": "The reporting is still good",
              "rhetoricalRole": "contrastive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s10c0",
                  "text": "The reporting is still good",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "is",
                  "actor": "The reporting",
                  "action": "is",
                  "object": "good",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s11",
              "raw": "The problem was attribution custody and an over-hardened headline frame.",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s11c0",
                  "text": "The problem was attribution custody and an over-hardened headline frame",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "was",
                  "actor": "The problem",
                  "action": "was",
                  "object": "attribution custody over hardened headline",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "realizationSummary": {
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "connector-stance",
            "lexical-register",
            "abbreviation-posture",
            "fragment-posture",
            "punctuation-shape"
          ],
          "lexemeSwaps": [],
          "semanticRisk": 0.42,
          "donorProgress": {
            "eligible": true,
            "sourceDonorDistance": 3.408,
            "outputDonorDistance": 2.494,
            "donorImprovement": 0.914,
            "donorImprovementRatio": 0.268,
            "sourceOutputLexicalOverlap": 0.931
          },
          "realizationNotes": [
            "Register shift surfaced through lexical-register, abbreviation-posture, orthography-posture, fragment-posture.",
            "Semantic risk is elevated; review the realized output before relying on it."
          ],
          "rescuePasses": [
            "td613-aperture-warning"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "generatorVersion": "v2",
        "sourceClass": "procedural-record",
        "candidateLedger": [
          {
            "id": "base",
            "envelopeId": "spark",
            "status": "selected",
            "score": 0.8106,
            "rewriteStrength": 0.9385,
            "targetFit": 0.5382,
            "movementConfidence": 0.94,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Team. We need to tighten the correction chain on the council-housing story. Paragraph six carried the right quote but the wrong speaker label. It was Nia Brooks"
          },
          {
            "id": "amplified",
            "envelopeId": "spark",
            "status": "eligible",
            "score": 0.4736,
            "rewriteStrength": 0.4973,
            "targetFit": 0.3621,
            "movementConfidence": 0.66,
            "failureReasons": [],
            "transferClass": "rejected",
            "outputPreview": "Team, we need to tighten the correction chain on the council-housing story. Paragraph six carried the right quote but the wrong speaker label: it was Nia Brooks"
          },
          {
            "id": "contrast",
            "envelopeId": "spark",
            "status": "eligible",
            "score": 0.4702,
            "rewriteStrength": 0.4973,
            "targetFit": 0.3515,
            "movementConfidence": 0.66,
            "failureReasons": [],
            "transferClass": "rejected",
            "outputPreview": "Team, we need to tighten the correction chain on the council-housing story. Paragraph six carried the right quote but the wrong speaker label: it was Nia Brooks"
          },
          {
            "id": "conservative",
            "envelopeId": "spark",
            "status": "eligible",
            "score": 0.4778,
            "rewriteStrength": 0.4973,
            "targetFit": 0.3753,
            "movementConfidence": 0.66,
            "failureReasons": [],
            "transferClass": "rejected",
            "outputPreview": "Team, we need to tighten the correction chain on the council-housing story. Paragraph six carried the right quote but the wrong speaker label: it was Nia Brooks"
          }
        ],
        "generationDocket": {
          "status": "landed",
          "holdClass": null,
          "headline": "Generator V2 landed a registered rewrite.",
          "reasons": [],
          "candidateCount": 4,
          "winningCandidateId": "base"
        },
        "winningCandidateId": "base"
      },
      "semanticContract": {
        "transferClass": "structural",
        "realizationTier": "lexical-structural",
        "changedDimensions": [
          "abbreviation-posture",
          "connector-stance",
          "fragment-posture",
          "lexical-register",
          "punctuation-shape",
          "sentence-count",
          "sentence-mean"
        ],
        "lexemeSwapFamilies": [],
        "relationInventory": [
          "additive:4",
          "causal:1",
          "clarifying:0",
          "contrastive:2",
          "resumptive:1",
          "temporal:1"
        ],
        "structuralOperations": [
          "baseline-split",
          "clause-join-split",
          "planned-sentence-split",
          "sentence-structure"
        ],
        "lexicalOperations": [
          "baseline-stance",
          "baseline-voice-realization",
          "connector-stance-lexicon",
          "punctuation-finish"
        ],
        "connectorStrategy": "additive",
        "contractionStrategy": "hold",
        "propositionCoverage": 1,
        "actorCoverage": 0.902,
        "actionCoverage": 1,
        "objectCoverage": 0.925,
        "polarityMismatches": 1,
        "tenseMismatches": 0,
        "protectedAnchorIntegrity": 1
      }
    },
    "newsroom-correction-rushed-mobile-under-professional-message": {
      "id": "newsroom-correction-rushed-mobile-under-professional-message",
      "category": "retrieval-same-fact",
      "strength": 0.88,
      "sourceText": "need quick fix on housing story. quote in graf 6 is nia brooks not moreno. words are right, speaker tag isnt. brooks emailed 9:31. body fixed 9:47 + note added. also homepage hed now sounds like vote passed when it only cleared committee. can someone swap that before newsletter grab",
      "donorText": "Team, we need to tighten the correction chain on the council-housing story. Paragraph six carried the right quote but the wrong speaker label: it was Nia Brooks, not Deputy Director Laila Moreno. Brooks flagged it at 9:31 AM, and we corrected the body at 9:47 with a note appended. We also changed the homepage headline at 10:03 because the first version implied budget approval when the vote had only cleared committee. Please keep the distinction clear in any follow-up: this is a correction and clarification sequence, not a retraction. The reporting is still good. The problem was attribution custody and an over-hardened headline frame.",
      "donorSummary": {
        "mode": "borrowed",
        "strength": 0.88,
        "profile": {
          "avgSentenceLength": 15.71,
          "sentenceCount": 7,
          "contractionDensity": 0,
          "punctuationDensity": 0.173,
          "contentWordComplexity": 0.412,
          "modifierDensity": 0.015,
          "directness": 0.18,
          "abstractionPosture": 0.667
        }
      },
      "retrievalTrace": {
        "sourceText": "need quick fix on housing story. quote in graf 6 is nia brooks not moreno. words are right, speaker tag isnt. brooks emailed 9:31. body fixed 9:47 + note added. also homepage hed now sounds like vote passed when it only cleared committee. can someone swap that before newsletter grab",
        "donorProfileSummary": {
          "mode": "borrowed",
          "label": "native cadence",
          "strength": 1,
          "profile": {
            "avgSentenceLength": 17.41,
            "sentenceCount": 7,
            "contractionDensity": 0,
            "punctuationDensity": 0.165,
            "lineBreakDensity": 0,
            "contentWordComplexity": 0.377,
            "modifierDensity": 0.017,
            "hedgeDensity": 0,
            "directness": 0.18,
            "abstractionPosture": 0.652,
            "latinatePreference": 0.092,
            "recurrencePressure": 0.18
          }
        },
        "sourceIR": {
          "metadata": {
            "sentenceCount": 7,
            "clauseCount": 8,
            "literalSpans": [
              {
                "value": "9:31",
                "placeholder": "__PROTLIT_A__"
              },
              {
                "value": "9:47",
                "placeholder": "__PROTLIT_B__"
              },
              {
                "value": "6",
                "placeholder": "__PROTLIT_C__"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "need quick fix on housing story",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "need quick fix on housing story",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "need",
                  "actor": "",
                  "action": "need",
                  "object": "quick fix housing story",
                  "modifiers": [
                    "quick"
                  ],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "quote in graf __PROTLIT_C__ is nia brooks not moreno",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "quote in graf __PROTLIT_C__ is nia brooks not moreno",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "is",
                  "actor": "",
                  "action": "is",
                  "object": "nia brooks moreno",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s2",
              "raw": "words are right, speaker tag isnt",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s2c0",
                  "text": "words are right, speaker tag isnt",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "are",
                  "actor": "",
                  "action": "are",
                  "object": "right speaker tag isnt",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s3",
              "raw": "brooks emailed __PROTLIT_A__",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s3c0",
                  "text": "brooks emailed __PROTLIT_A__",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "brooks",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s4",
              "raw": "body fixed __PROTLIT_B__ + note added",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s4c0",
                  "text": "body fixed __PROTLIT_B__ + note added",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "fixed",
                  "actor": "",
                  "action": "fixed",
                  "object": "protlit b note added",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s5",
              "raw": "also homepage hed now sounds like vote passed when it only cleared committee",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s5c0",
                  "text": "also homepage hed now sounds like vote passed",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "homepage",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s5c1",
                  "text": "it only cleared committee",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "cleared",
                  "actor": "it",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "only"
                  ],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                }
              ]
            },
            {
              "id": "s6",
              "raw": "can someone swap that before newsletter grab",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s6c0",
                  "text": "can someone swap that before newsletter grab",
                  "relationToPrev": "start",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "grab",
                  "actor": "that",
                  "action": "grab",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "opportunityProfile": {
          "sentenceSplit": 0,
          "sentenceMerge": 6,
          "contraction": 0,
          "connector": 2,
          "lineBreak": 6,
          "abbreviation": 0,
          "orthography": 8,
          "fragment": 0,
          "conversational": 0,
          "additive": 1,
          "contrastive": 0,
          "causal": 0,
          "temporal": 2,
          "clarifying": 0,
          "resumptive": 0
        },
        "planSummary": {
          "transferMode": "expand",
          "structuralOperationsSelected": [
            "clause-texture"
          ],
          "lexicalRegisterOperationsSelected": [],
          "connectorStrategy": "temporal",
          "contractionStrategy": "hold",
          "relationInventory": {
            "additive": 1,
            "contrastive": 0,
            "causal": 0,
            "temporal": 2,
            "clarifying": 0,
            "resumptive": 0
          },
          "structuralGoals": {
            "sentenceCountDelta": 0,
            "avgSentenceDelta": 10.120000000000001
          },
          "discourseGoals": {
            "contractionDelta": 0,
            "hedgeDelta": 0
          },
          "registerGoals": {
            "contentWordComplexityDelta": 0.123,
            "modifierDensityDelta": -0.008,
            "directnessDelta": 0,
            "abstractionDelta": 0.15200000000000002,
            "latinateDelta": 0.092,
            "registerMode": "reflective"
          },
          "operationBudget": {
            "splitSentence": 0,
            "mergeSentence": 11,
            "swapConnector": 2,
            "applyHedge": 0,
            "realizeLexicon": 5
          }
        },
        "candidateSummary": {
          "selected": {
            "spec": "ir-beam-search",
            "score": 347.72,
            "passesApplied": [
              "baseline-floor",
              "clause-texture"
            ],
            "rescuePasses": [],
            "changedDimensions": [
              "sentence-mean",
              "sentence-count",
              "sentence-spread",
              "connector-stance",
              "lexical-register",
              "abbreviation-posture",
              "orthography-posture",
              "punctuation-shape"
            ],
            "qualityGatePassed": true,
            "notes": []
          },
          "candidates": [
            {
              "spec": "ir-beam-search",
              "score": 347.72,
              "passesApplied": [
                "baseline-floor",
                "clause-texture"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "lexical-register",
                "abbreviation-posture",
                "orthography-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "mixed-structural",
              "score": 292.764,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "baseline-function-word",
                "planned-sentence-merge",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "abbreviation-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "merge-heavy",
              "score": 292.764,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "baseline-function-word",
                "planned-sentence-merge",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "abbreviation-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "connector-stance-heavy",
              "score": 292.764,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "baseline-function-word",
                "planned-sentence-merge",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "abbreviation-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            },
            {
              "spec": "lexical-register-heavy",
              "score": 292.764,
              "passesApplied": [
                "baseline-merge",
                "baseline-voice-realization",
                "baseline-function-word",
                "planned-sentence-merge",
                "sentence-structure",
                "clause-join-split",
                "connector-stance-lexicon",
                "cleanup-restore"
              ],
              "rescuePasses": [],
              "changedDimensions": [
                "sentence-mean",
                "sentence-count",
                "sentence-spread",
                "connector-stance",
                "abbreviation-posture",
                "punctuation-shape"
              ],
              "qualityGatePassed": true,
              "notes": []
            }
          ]
        },
        "finalRealization": {
          "text": "Need steady resolve on housing account; and quote in graf 6 is nia brooks not moreno; words are right, speaker tag isnt; and brooks emailed 9:31. Body resolved 9:47, note added; also homepage hed now sounds like vote passed when it only cleared committee; can someone swap this before newsletter grab.",
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "sentence-spread",
            "connector-stance",
            "lexical-register",
            "abbreviation-posture",
            "orthography-posture",
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "story",
              "from": "story",
              "to": "account",
              "kind": "lexeme"
            },
            {
              "family": "fast",
              "from": "quick",
              "to": "steady",
              "kind": "lexeme"
            },
            {
              "family": "fix",
              "from": "fixed",
              "to": "resolved",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.42,
          "donorProgress": {
            "eligible": true,
            "sourceDonorDistance": 3.588,
            "outputDonorDistance": 2.418,
            "donorImprovement": 1.17,
            "donorImprovementRatio": 0.326,
            "sourceOutputLexicalOverlap": 0.8
          },
          "rescuePasses": [
            "td613-aperture-warning"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "semanticAudit": {
          "propositionCoverage": 1,
          "actorCoverage": 1,
          "actionCoverage": 1,
          "objectCoverage": 0.969,
          "polarityMismatches": 1,
          "tenseMismatches": 0,
          "protectedAnchorIntegrity": 1,
          "clauseAudits": [
            {
              "sourceClauseId": "s0c0",
              "matchedClauseId": "s0c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.278
            },
            {
              "sourceClauseId": "s1c0",
              "matchedClauseId": "s0c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.167
            },
            {
              "sourceClauseId": "s2c0",
              "matchedClauseId": "s0c2",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.222
            },
            {
              "sourceClauseId": "s3c0",
              "matchedClauseId": "s0c3",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.056
            },
            {
              "sourceClauseId": "s4c0",
              "matchedClauseId": "s1c0",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 0.75,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 0.429,
              "globalBagScore": 0.15
            },
            {
              "sourceClauseId": "s5c0",
              "matchedClauseId": "s1c1",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.056
            },
            {
              "sourceClauseId": "s5c1",
              "matchedClauseId": "s0c2+s0c3",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 1,
              "tenseMismatch": 0,
              "bagScore": 0,
              "globalBagScore": 0
            },
            {
              "sourceClauseId": "s6c0",
              "matchedClauseId": "s1c2",
              "propositionCoverage": 1,
              "actorCoverage": 1,
              "actionCoverage": 1,
              "objectCoverage": 1,
              "polarityMismatch": 0,
              "tenseMismatch": 0,
              "bagScore": 1,
              "globalBagScore": 0.056
            }
          ],
          "sourceClauseCount": 8,
          "outputClauseCount": 7
        },
        "protectedAnchorAudit": {
          "totalAnchors": 3,
          "resolvedAnchors": 3,
          "missingAnchors": [],
          "protectedAnchorIntegrity": 1
        },
        "realizedIR": {
          "metadata": {
            "sentenceCount": 2,
            "clauseCount": 7,
            "literalSpans": [
              {
                "value": "9:31",
                "placeholder": "__PROTLIT_A__"
              },
              {
                "value": "9:47",
                "placeholder": "__PROTLIT_B__"
              },
              {
                "value": "6",
                "placeholder": "__PROTLIT_C__"
              }
            ]
          },
          "sentences": [
            {
              "id": "s0",
              "raw": "Need steady resolve on housing account; and quote in graf 6 is nia brooks not moreno; words are right, speaker tag isnt; and brooks emailed 9:31",
              "rhetoricalRole": "additive",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s0c0",
                  "text": "Need steady resolve on housing account",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "Need",
                  "actor": "",
                  "action": "Need",
                  "object": "steady resolve housing account",
                  "modifiers": [
                    "steady"
                  ],
                  "hedgeMarkers": []
                },
                {
                  "id": "s0c1",
                  "text": "and quote in graf 6 is nia brooks not moreno",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "is",
                  "actor": "",
                  "action": "is",
                  "object": "nia brooks moreno",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s0c2",
                  "text": "words are right, speaker tag isnt",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "negative",
                  "tenseAspect": "present",
                  "propositionHead": "are",
                  "actor": "",
                  "action": "are",
                  "object": "right speaker tag isnt",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s0c3",
                  "text": "and brooks emailed 9:31",
                  "relationToPrev": "additive",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "brooks",
                  "actor": "",
                  "action": "",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            },
            {
              "id": "s1",
              "raw": "Body resolved 9:47, note added; also homepage hed now sounds like vote passed when it only cleared committee; can someone swap this before newsletter grab.",
              "rhetoricalRole": "temporal",
              "terminalPunct": ".",
              "clauses": [
                {
                  "id": "s1c0",
                  "text": "Body resolved 9:47, note added",
                  "relationToPrev": "start",
                  "clauseType": "fragment",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "resolved",
                  "actor": "",
                  "action": "resolved",
                  "object": "9 47 note added",
                  "modifiers": [],
                  "hedgeMarkers": []
                },
                {
                  "id": "s1c1",
                  "text": "also homepage hed now sounds like vote passed when it only cleared committee",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "past",
                  "propositionHead": "homepage",
                  "actor": "it",
                  "action": "",
                  "object": "",
                  "modifiers": [
                    "only"
                  ],
                  "hedgeMarkers": [
                    "minimization"
                  ]
                },
                {
                  "id": "s1c2",
                  "text": "can someone swap this before newsletter grab",
                  "relationToPrev": "additive",
                  "clauseType": "main",
                  "polarity": "positive",
                  "tenseAspect": "present",
                  "propositionHead": "grab",
                  "actor": "this",
                  "action": "grab",
                  "object": "",
                  "modifiers": [],
                  "hedgeMarkers": []
                }
              ]
            }
          ]
        },
        "realizationSummary": {
          "transferClass": "structural",
          "borrowedShellOutcome": "structural",
          "borrowedShellFailureClass": null,
          "realizationTier": "lexical-structural",
          "changedDimensions": [
            "sentence-mean",
            "sentence-count",
            "sentence-spread",
            "connector-stance",
            "lexical-register",
            "abbreviation-posture",
            "orthography-posture",
            "punctuation-shape"
          ],
          "lexemeSwaps": [
            {
              "family": "story",
              "from": "story",
              "to": "account",
              "kind": "lexeme"
            },
            {
              "family": "fast",
              "from": "quick",
              "to": "steady",
              "kind": "lexeme"
            },
            {
              "family": "fix",
              "from": "fixed",
              "to": "resolved",
              "kind": "lexeme"
            }
          ],
          "semanticRisk": 0.42,
          "donorProgress": {
            "eligible": true,
            "sourceDonorDistance": 3.588,
            "outputDonorDistance": 2.418,
            "donorImprovement": 1.17,
            "donorImprovementRatio": 0.326,
            "sourceOutputLexicalOverlap": 0.8
          },
          "realizationNotes": [
            "3 lexical family swaps landed.",
            "Register shift surfaced through lexical-register, abbreviation-posture, orthography-posture.",
            "Semantic risk is elevated; review the realized output before relying on it."
          ],
          "rescuePasses": [
            "td613-aperture-warning"
          ],
          "visibleShift": true,
          "nonTrivialShift": true
        },
        "generatorVersion": "v2",
        "sourceClass": "formal-correspondence",
        "candidateLedger": [
          {
            "id": "base",
            "envelopeId": "matron",
            "status": "eligible",
            "score": 0.7825,
            "rewriteStrength": 1,
            "targetFit": 0.3203,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Need steady resolve on housing account; quote in graf 6 is nia brooks not moreno; words are right, speaker tag isnt; and brooks emailed 9:31. Body resolved 9:47"
          },
          {
            "id": "amplified",
            "envelopeId": "matron",
            "status": "eligible",
            "score": 0.7864,
            "rewriteStrength": 1,
            "targetFit": 0.3324,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Need steady resolve on housing account; and quote in graf 6 is nia brooks not moreno; words are right, speaker tag isnt; and brooks emailed 9:31. Body resolved "
          },
          {
            "id": "contrast",
            "envelopeId": "matron",
            "status": "selected",
            "score": 0.7956,
            "rewriteStrength": 1,
            "targetFit": 0.3612,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Need steady resolve on housing account; and quote in graf 6 is nia brooks not moreno; words are right, speaker tag isnt; and brooks emailed 9:31. Body resolved "
          },
          {
            "id": "conservative",
            "envelopeId": "matron",
            "status": "eligible",
            "score": 0.7865,
            "rewriteStrength": 1,
            "targetFit": 0.3329,
            "movementConfidence": 1,
            "failureReasons": [],
            "transferClass": "structural",
            "outputPreview": "Need fast fix on housing story; quote in graf 6 is nia brooks not moreno; words are right, speaker tag isnt; brooks emailed 9:31. Body fixed 9:47, note added; a"
          }
        ],
        "generationDocket": {
          "status": "landed",
          "holdClass": null,
          "headline": "Generator V2 landed a registered rewrite.",
          "reasons": [],
          "candidateCount": 4,
          "winningCandidateId": "contrast"
        },
        "winningCandidateId": "contrast"
      },
      "semanticContract": {
        "transferClass": "structural",
        "realizationTier": "lexical-structural",
        "changedDimensions": [
          "abbreviation-posture",
          "connector-stance",
          "lexical-register",
          "orthography-posture",
          "punctuation-shape",
          "sentence-count",
          "sentence-mean",
          "sentence-spread"
        ],
        "lexemeSwapFamilies": [
          "fast",
          "fix",
          "story"
        ],
        "relationInventory": [
          "additive:1",
          "causal:0",
          "clarifying:0",
          "contrastive:0",
          "resumptive:0",
          "temporal:2"
        ],
        "structuralOperations": [
          "clause-texture"
        ],
        "lexicalOperations": [],
        "connectorStrategy": "temporal",
        "contractionStrategy": "hold",
        "propositionCoverage": 1,
        "actorCoverage": 1,
        "actionCoverage": 1,
        "objectCoverage": 0.969,
        "polarityMismatches": 1,
        "tenseMismatches": 0,
        "protectedAnchorIntegrity": 1
      }
    }
  }
};
})();
