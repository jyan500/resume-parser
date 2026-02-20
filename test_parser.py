#!/usr/bin/env python3

import os
import requests
import json
from pathlib import Path

# Configuration
TEST_DIR = "test-resumes"
API_URL = "http://localhost:5000/parse-resume"

def test_resume(filepath):
    """Test a single resume file"""
    filename = os.path.basename(filepath)
    print(f"\n{'='*60}")
    print(f"Testing: {filename}")
    print('='*60)
    
    try:
        with open(filepath, 'rb') as f:
            files = {'resume': (filename, f)}
            response = requests.post(API_URL, files=files)
        
        if response.status_code == 200:
            print("**** SUCCESS ****")
            print("\nExtracted Data:")
            print(json.dumps(response.json(), indent=2))
            return True
        else:
            print(f"FAILED (Status: {response.status_code})")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"ERROR: {str(e)}")
        return False

def main():
    """Run tests on all resumes in test directory"""
    
    if not os.path.exists(TEST_DIR):
        print(f"Error: Directory '{TEST_DIR}' not found")
        return
    
    # Get all files in test directory
    files = [f for f in Path(TEST_DIR).iterdir() if f.is_file()]
    
    if not files:
        print(f"No files found in '{TEST_DIR}'")
        return
    
    print(f"Found {len(files)} files to test")
    
    results = []
    for filepath in sorted(files):
        success = test_resume(str(filepath))
        results.append((filepath.name, success))
    
    # Summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    successes = sum(1 for _, success in results if success)
    failures = len(results) - successes
    
    print(f"**** Total: {len(results)} ****")
    print(f"Successes: {successes}")
    print(f"Failures: {failures}")
    
    if failures > 0:
        print("\nFailed files:")
        for filename, success in results:
            if not success:
                print(f"  - {filename}")

if __name__ == "__main__":
    main()
