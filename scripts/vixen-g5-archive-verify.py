#!/usr/bin/env python3
"""G5: verify the actual downloaded ZIP members against the in-ZIP digest map.
The record census/index remains distinct from original body availability.
A verified ZIP cannot attest browser boot or source author/origin.
"""
import hashlib
import json
import pathlib
import stat
import sys
import zipfile

def verify_and_extract(src, destination):
    target = pathlib.Path(destination)
    with zipfile.ZipFile(src) as archive:
        names = archive.namelist()
        assert len(names) == len(set(names)), "DUPLICATE_ZIP_MEMBER"
        assert all(n and not n.startswith("/") and ".." not in n.split("/") for n in names), "ZIP_MEMBER_PATH_REFUSAL"
        assert all(not stat.S_ISLNK(member.external_attr >> 16) for member in archive.infolist()), "SYMLINK_REFUSAL"
        name = "encyclopedia/vixen-estate/portable-fidelity-manifest.json"
        assert name in names, "MISSING_FIDELITY_MANIFEST"
        manifest = json.loads(archive.read(name))
        assert manifest["schema"] == "td613.vixen.portable-fidelity/v1"
        verified = 0
        for path, meta in manifest["file_digests_sha256"].items():
            assert path in names, "MISSING_HASHED_MEMBER:" + path
            body = archive.read(path)
            assert len(body) == meta["bytes"], "BYTE_LENGTH_MISMATCH:" + path
            assert hashlib.sha256(body).hexdigest() == meta["sha256"], "SHA256_MISMATCH:" + path
            verified += 1
        assert len(names) == verified + 1, "MANIFEST_COVERAGE_GAP"
        target.mkdir(parents=True, exist_ok=True)
        archive.extractall(target)
        return {
            "member_count": len(names),
            "verified_sha256_count": verified,
            "manifest": manifest["fidelity"],
            "reference": manifest["reference"],
        }

if __name__ == "__main__":
    print(json.dumps(verify_and_extract(sys.argv[1], sys.argv[2]), sort_keys=True))
