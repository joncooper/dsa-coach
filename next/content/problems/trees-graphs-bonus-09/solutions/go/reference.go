package solution

func IslandPerimeter(grid [][]int) int {
	perimeter := 0
	for row := 0; row < len(grid); row++ {
		for col := 0; col < len(grid[row]); col++ {
			if grid[row][col] != 1 { continue }
			perimeter += 4
			if row > 0 && grid[row-1][col] == 1 { perimeter -= 2 }
			if col > 0 && grid[row][col-1] == 1 { perimeter -= 2 }
		}
	}
	return perimeter
}
