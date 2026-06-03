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
		if text, ok := responseBody(response).(string); ok && text == "congrats" {
			return strPtr(url)
		}

		for _, nextURL := range nextURLsFrom(response) {
			if seen[nextURL] {
				continue
			}
			seen[nextURL] = true
			queue = append(queue, nextURL)
		}
	}

	return nil
}

func nextURLsFrom(response any) []string {
	body, ok := response.(map[string]any)
	if !ok {
		return nil
	}

	if code := status(response); code == 301 || code == 302 {
		location, ok := body["location"].(string)
		if !ok {
			return nil
		}
		return []string{location}
	}

	linkBody := response
	if status(response) == 200 {
		linkBody = body["body"]
	}

	linkMap, ok := linkBody.(map[string]any)
	if !ok {
		return nil
	}

	urls, ok := linkMap["urls"].([]any)
	if !ok {
		return nil
	}

	nextURLs := make([]string, 0, len(urls))
	for _, next := range urls {
		if nextURL, ok := next.(string); ok {
			nextURLs = append(nextURLs, nextURL)
		}
	}
	return nextURLs
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

func responseBody(response any) any {
	body, ok := response.(map[string]any)
	if !ok || status(response) != 200 {
		return nil
	}
	return body["body"]
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
