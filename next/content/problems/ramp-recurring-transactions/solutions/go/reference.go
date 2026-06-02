package solution

import (
	"sort"
	"strings"
	"time"
)

var cadenceOrder = map[string]int{"DAILY": 0, "WEEKLY": 1, "MONTHLY": 2}

func RecurringTransactions(transactions [][]string) [][]string {
	groups := map[string][]time.Time{}
	for _, row := range transactions {
		key := strings.Join([]string{row[1], row[2], row[3]}, "\x00")
		groups[key] = append(groups[key], parseDate(row[0]))
	}

	out := [][]string{}
	for key, dates := range groups {
		sort.Slice(dates, func(i, j int) bool {
			return dates[i].Before(dates[j])
		})
		dates = uniqueDates(dates)
		cadence := bestCadence(dates)
		if cadence != "" {
			parts := strings.Split(key, "\x00")
			out = append(out, []string{parts[0], parts[1], parts[2], cadence})
		}
	}

	sort.Slice(out, func(i, j int) bool {
		for col := 0; col < 3; col++ {
			if out[i][col] != out[j][col] {
				return out[i][col] < out[j][col]
			}
		}
		return false
	})
	return out
}

func bestCadence(dates []time.Time) string {
	type candidate struct {
		name   string
		length int
	}
	candidates := []candidate{
		{"DAILY", longestStreak(dates, func(a, b time.Time) bool { return b.Sub(a) == 24*time.Hour })},
		{"WEEKLY", longestStreak(dates, func(a, b time.Time) bool { return b.Sub(a) == 7*24*time.Hour })},
		{"MONTHLY", longestStreak(dates, isNextMonth)},
	}

	best := candidate{"", 0}
	for _, item := range candidates {
		if item.length < 3 {
			continue
		}
		if item.length > best.length || (item.length == best.length && cadenceOrder[item.name] < cadenceOrder[best.name]) {
			best = item
		}
	}
	return best.name
}

func longestStreak(dates []time.Time, follows func(time.Time, time.Time) bool) int {
	if len(dates) == 0 {
		return 0
	}
	best := 1
	current := 1
	for index := 1; index < len(dates); index++ {
		if follows(dates[index-1], dates[index]) {
			current++
		} else {
			current = 1
		}
		if current > best {
			best = current
		}
	}
	return best
}

func isNextMonth(prev, curr time.Time) bool {
	year, month, _ := prev.Date()
	nextMonth := month + 1
	if nextMonth == 13 {
		nextMonth = 1
		year++
	}
	currYear, currMonth, _ := curr.Date()
	if currYear != year || currMonth != nextMonth {
		return false
	}
	return prev.Day() == curr.Day() || (isMonthEnd(prev) && isMonthEnd(curr))
}

func isMonthEnd(day time.Time) bool {
	next := day.AddDate(0, 0, 1)
	return next.Day() == 1
}

func parseDate(value string) time.Time {
	parsed, _ := time.Parse("2006-01-02", value)
	return parsed
}

func uniqueDates(dates []time.Time) []time.Time {
	out := []time.Time{}
	for _, day := range dates {
		if len(out) == 0 || !out[len(out)-1].Equal(day) {
			out = append(out, day)
		}
	}
	return out
}
