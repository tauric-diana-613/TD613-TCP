"""Synthetic-only recipient process entry. This process grants no sandbox assurance."""
import argparse
from pathlib import Path
from . import core,native_runner

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('origin');p.add_argument('output');p.add_argument('--return-id',required=True);p.add_argument('--recipient-id',required=True)
    a=p.parse_args();target=Path(a.output)
    core.need(not target.exists(),'RETURN_OUTPUT_MUST_BE_NEW')
    raw=Path(a.origin).read_bytes();ret=core.make_return(raw,return_id=a.return_id,recipient_id=a.recipient_id,runner=native_runner.run)
    with target.open('xb') as f:f.write(ret)
if __name__=='__main__':main()
