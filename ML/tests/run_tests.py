"""
Test Runner for Shadow Sentinel ML Suite.
Executes unit and integration tests using Python built-in unittest module.
"""

import unittest
import sys
import os

def run_suite():
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
    loader = unittest.TestLoader()
    start_dir = os.path.dirname(__file__)
    suite = loader.discover(start_dir, pattern="test_*.py")

    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    sys.exit(not result.wasSuccessful())

if __name__ == "__main__":
    run_suite()
