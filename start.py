import subprocess
import sys
import os
import webbrowser
from time import sleep
import shutil

def is_windows():
    return sys.platform.startswith('win')

def get_venv_python():
    if is_windows():
        return os.path.join('backend', 'venv', 'Scripts', 'python.exe')
    return os.path.join('backend', 'venv', 'bin', 'python')

def get_npm():
    return 'npm.cmd' if is_windows() else 'npm'

def cleanup_backend():
    print("Cleaning up old virtual environment...")
    venv_path = os.path.join('backend', 'venv')
    if os.path.exists(venv_path):
        shutil.rmtree(venv_path)

def setup_backend():
    print("Setting up backend...")
    cleanup_backend()  # Clean up before setup
    subprocess.run([sys.executable, '-m', 'venv', os.path.join('backend', 'venv')], check=True)
    
    # Upgrade pip first
    pip_upgrade_cmd = [get_venv_python(), '-m', 'pip', 'install', '--upgrade', 'pip']
    subprocess.run(pip_upgrade_cmd, check=True)
    
    # Install requirements
    pip_cmd = [get_venv_python(), '-m', 'pip', 'install', '-r', os.path.join('backend', 'requirements.txt')]
    subprocess.run(pip_cmd, check=True)

def setup_frontend():
    print("Setting up frontend...")
    npm = get_npm()
    subprocess.run([npm, 'install'], cwd='frontend', check=True)

def start_backend():
    print("Starting backend server...")
    python_path = get_venv_python()
    return subprocess.Popen([python_path, os.path.join('backend', 'app.py')])

def start_frontend():
    print("Starting frontend development server...")
    npm = get_npm()
    return subprocess.Popen([npm, 'run', 'dev'], cwd='frontend')

def main():
    try:
        # Setup phase
        print("🚀 Setting up NextHire development environment...")
        setup_backend()
        setup_frontend()

        # Start servers
        print("\n📡 Starting servers...")
        backend_process = start_backend()
        frontend_process = start_frontend()

        # Wait for servers to start
        print("\n⏳ Waiting for servers to start...")
        sleep(5)  # Give servers time to start

        # Open browser
        print("\n🌐 Opening application in browser...")
        webbrowser.open('http://localhost:5173')

        print("\n✨ NextHire is running!")
        print("Frontend: http://localhost:5173")
        print("Backend:  http://localhost:5000")
        print("\nPress Ctrl+C to stop all servers...")

        # Keep the script running
        backend_process.wait()
        frontend_process.wait()

    except KeyboardInterrupt:
        print("\n\n🛑 Shutting down servers...")
        frontend_process.terminate()
        backend_process.terminate()
        print("Goodbye! 👋")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 