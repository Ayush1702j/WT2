import os
import zipfile
import sys

def create_zip(prn="2304362", name="Ayush"):
    project_dir = os.path.dirname(os.path.abspath(__file__))
    zip_filename = f"{prn}_{name}_P2_Registration.zip"
    zip_filepath = os.path.join(project_dir, zip_filename)

    included_dirs = ["css", "js"]
    included_files = ["index.html"]

    with zipfile.ZipFile(zip_filepath, "w", zipfile.ZIP_DEFLATED) as zipf:
        for file in included_files:
            file_path = os.path.join(project_dir, file)
            if os.path.exists(file_path):
                zipf.write(file_path, file)
                print(f"Added {file}")

        for d in included_dirs:
            dir_path = os.path.join(project_dir, d)
            if os.path.exists(dir_path):
                for root, _, files in os.walk(dir_path):
                    for f in files:
                        full_p = os.path.join(root, f)
                        rel_p = os.path.relpath(full_p, project_dir)
                        zipf.write(full_p, rel_p)
                        print(f"Added {rel_p}")

    print(f"\n[SUCCESS] Generated Assignment 2 zip: {zip_filepath} ({os.path.getsize(zip_filepath):,} bytes)")

if __name__ == "__main__":
    prn = sys.argv[1] if len(sys.argv) > 1 else "2304362"
    name = sys.argv[2] if len(sys.argv) > 2 else "Ayush"
    create_zip(prn, name)
