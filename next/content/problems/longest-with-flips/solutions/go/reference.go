package solution

func LongestWithFlips(bits []int, k int) int {
	left := 0
	zeroes := 0
	best := 0
	for right, bit := range bits {
		if bit == 0 {
			zeroes++
		}
		for zeroes > k {
			if bits[left] == 0 {
				zeroes--
			}
			left++
		}
		length := right - left + 1
		if length > best {
			best = length
		}
	}
	return best
}
