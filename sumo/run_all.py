"""Run every lab in Go 2 and every experiment in Go 3 (about 30-40 minutes)."""
import glob, os, subprocess, sys
here = os.path.dirname(os.path.abspath(__file__))
for f in sorted(glob.glob(f"{here}/go2/*.py")) + sorted(glob.glob(f"{here}/go3/*.py")):
    print(f"\n=== {os.path.basename(f)} ===", flush=True)
    subprocess.run([sys.executable, f], check=True)
