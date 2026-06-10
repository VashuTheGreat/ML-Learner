class Solution:
    def twoSum(self, nums, target):
        lookup = {}
        for i, num in enumerate(nums):
            diff = target - num
            if diff in lookup:
                return [lookup[diff], i]
            lookup[num] = i


import json

sol = Solution()
results = []

try:
    test_input = ['print(round(compute_efficiency(1000, 2, 512, 512),1))']

    output = sol.compute_efficiency(*test_input)

    # torch / numpy support
    if hasattr(output, "tolist"):
        output = output.tolist()

    passed = output == 99.8

    results.append({
        "test_case": 1,
        "input": test_input,
        "passed": passed,
        "expected": 99.8,
        "got": output
    })

except Exception as e:
    results.append({
        "test_case": 1,
        "input": ['print(round(compute_efficiency(1000, 2, 512, 512),1))'],
        "passed": False,
        "error": str(e)
    })

try:
    test_input = ['print(round(compute_efficiency(10, 2, 256, 256),1))']

    output = sol.compute_efficiency(*test_input)

    # torch / numpy support
    if hasattr(output, "tolist"):
        output = output.tolist()

    passed = output == 80.0

    results.append({
        "test_case": 2,
        "input": test_input,
        "passed": passed,
        "expected": 80.0,
        "got": output
    })

except Exception as e:
    results.append({
        "test_case": 2,
        "input": ['print(round(compute_efficiency(10, 2, 256, 256),1))'],
        "passed": False,
        "error": str(e)
    })

print(json.dumps(results))
