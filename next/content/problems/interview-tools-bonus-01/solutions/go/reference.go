package solution

func ReverseVowels(text string) string {
	vowels := map[rune]bool{'a': true, 'e': true, 'i': true, 'o': true, 'u': true, 'A': true, 'E': true, 'I': true, 'O': true, 'U': true}
	chars := []rune(text)
	left, right := 0, len(chars)-1
	for left < right { if !vowels[chars[left]] { left++ } else if !vowels[chars[right]] { right-- } else { chars[left], chars[right] = chars[right], chars[left]; left++; right-- } }
	return string(chars)
}
