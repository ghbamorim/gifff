import base64
import getpass
import hashlib
import json
import subprocess

username = input("Usuário: ")
password = getpass.getpass("Senha: ")

if len(password) < 12:
    raise SystemExit("Use pelo menos 12 caracteres.")

credentials = base64.b64encode(
    f"{username}:{password}".encode()
).decode()

digest = hashlib.sha256(
    f"Basic {credentials}".encode()
).hexdigest()

arn = subprocess.check_output(
    ["terraform", "output", "-raw", "auth_kvs_arn"],
    text=True
).strip()

store = json.loads(subprocess.check_output(
    ["aws", "cloudfront-keyvaluestore", "describe-key-value-store",
     "--kvs-arn", arn, "--profile", "terraform-lab"],
    text=True
))

subprocess.run(
    ["aws", "cloudfront-keyvaluestore", "put-key",
     "--kvs-arn", arn,
     "--key", "basic_auth_hash",
     "--value", digest,
     "--if-match", store["ETag"],
     "--profile", "terraform-lab"],
    check=True
)

print("Senha cadastrada.")