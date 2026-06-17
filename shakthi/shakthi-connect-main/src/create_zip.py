import os
import zipfile

def zip_project():
    # Current dir is .../src
    # Parent dir is project root
    src_dir = os.getcwd()
    project_root = os.path.dirname(src_dir)
    zip_filename = os.path.join(src_dir, 'shakthi_connect_backup.zip')
    
    print(f"Zipping from {project_root} to {zip_filename}")
    
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(project_root):
            # Exclude node_modules, .git, __pycache__, dist, build
            dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', '__pycache__', 'dist', 'build', '.agent', '.gemini']]
            
            for file in files:
                if file == 'shakthi_connect_backup.zip': continue
                if file.endswith('.zip'): continue
                
                file_path = os.path.join(root, file)
                # Compute relative path for zip archive
                arcname = os.path.relpath(file_path, project_root)
                try:
                    zipf.write(file_path, arcname)
                except Exception as e:
                    print(f"Could not zip {file_path}: {e}")
                
    print(f"Zip created successfully at: {zip_filename}")

if __name__ == "__main__":
    zip_project()
