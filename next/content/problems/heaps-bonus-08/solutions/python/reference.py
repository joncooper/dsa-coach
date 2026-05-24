def print_order(jobs: list[list[int]]) -> list[int]:
    return [job[1] for job in sorted(jobs, key=lambda job: (-job[0], job[1]))]
