package solution

func FindFinalURL(startURL string, maxRetries int) *string {
	queue := []string{startURL}
	seen := map[string]bool{startURL: true}

	for head := 0; head < len(queue); head++ {
		url := queue[head]
		response := readWithRetries(url, maxRetries)

		if text, ok := response.(string); ok && text == "congrats" {
			return strPtr(url)
		}

		body, ok := response.(map[string]any)
		if !ok {
			continue
		}

		urls, ok := body["urls"].([]any)
		if !ok {
			continue
		}

		for _, next := range urls {
			nextURL, ok := next.(string)
			if !ok || seen[nextURL] {
				continue
			}
			seen[nextURL] = true
			queue = append(queue, nextURL)
		}
	}

	return nil
}

func readWithRetries(url string, maxRetries int) any {
	for attempt := 0; attempt <= maxRetries; attempt++ {
		response := FetchURL(url)
		if status(response) == 503 {
			if attempt == maxRetries {
				return nil
			}
			continue
		}
		return response
	}
	return nil
}

func status(response any) int {
	body, ok := response.(map[string]any)
	if !ok {
		return 0
	}
	code, ok := body["status"].(int)
	if !ok {
		return 0
	}
	return code
}

func strPtr(value string) *string {
	return &value
}
