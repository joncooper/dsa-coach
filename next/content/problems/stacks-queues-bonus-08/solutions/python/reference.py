def asteroid_collision(asteroids: list[int]) -> list[int]:
    stack = []
    for asteroid in asteroids:
        active = asteroid
        alive = True
        while alive and active < 0 and stack and stack[-1] > 0:
            top = stack[-1]
            if top < -active:
                stack.pop()
            elif top == -active:
                stack.pop()
                alive = False
            else:
                alive = False
        if alive:
            stack.append(active)
    return stack
