package solution

import (
	"sort"
	"strconv"
	"strings"
)

type interval struct {
	start int
	end   int
}

type session struct {
	start        int
	end          int
	position     string
	compensation int
}

type pendingPromotion struct {
	position     string
	compensation int
	start        int
}

type worker struct {
	position           string
	compensation       int
	insideSince        *int
	activePosition     string
	activeCompensation int
	totalTime          int
	timeByPosition     map[string]int
	sessions           []session
	pending            *pendingPromotion
}

type workerRow struct {
	id   string
	time int
}

func Solution(queries [][]string) []string {
	workers := map[string]*worker{}
	doublePay := []interval{}
	out := []string{}

	coveredDoubleTime := func(start int, end int) int {
		clipped := []interval{}
		for _, period := range doublePay {
			left := maxInt(start, period.start)
			right := minInt(end, period.end)
			if left < right {
				clipped = append(clipped, interval{start: left, end: right})
			}
		}
		if len(clipped) == 0 {
			return 0
		}
		sort.Slice(clipped, func(i, j int) bool {
			if clipped[i].start != clipped[j].start {
				return clipped[i].start < clipped[j].start
			}
			return clipped[i].end < clipped[j].end
		})
		currentStart := clipped[0].start
		currentEnd := clipped[0].end
		total := 0
		for _, current := range clipped[1:] {
			if current.start <= currentEnd {
				currentEnd = maxInt(currentEnd, current.end)
			} else {
				total += currentEnd - currentStart
				currentStart = current.start
				currentEnd = current.end
			}
		}
		return total + currentEnd - currentStart
	}

	addSession := func(current *worker, start int, end int) {
		if end <= start {
			return
		}
		duration := end - start
		current.totalTime += duration
		current.timeByPosition[current.activePosition] += duration
		current.sessions = append(current.sessions, session{
			start:        start,
			end:          end,
			position:     current.activePosition,
			compensation: current.activeCompensation,
		})
	}

	applyPendingOnEntry := func(current *worker, timestamp int) {
		if current.pending == nil || timestamp < current.pending.start {
			return
		}
		current.position = current.pending.position
		current.compensation = current.pending.compensation
		current.pending = nil
	}

	calcSalary := func(current *worker, start int, end int) int {
		total := 0
		for _, session := range current.sessions {
			left := maxInt(start, session.start)
			right := minInt(end, session.end)
			if left >= right {
				continue
			}
			total += (right - left) * session.compensation
			total += coveredDoubleTime(left, right) * session.compensation
		}
		return total
	}

	topWorkers := func(count int, position string) string {
		if count <= 0 {
			return ""
		}
		rows := []workerRow{}
		for id, current := range workers {
			if current.position == position {
				rows = append(rows, workerRow{id: id, time: current.timeByPosition[position]})
			}
		}
		sort.Slice(rows, func(i, j int) bool {
			if rows[i].time != rows[j].time {
				return rows[i].time > rows[j].time
			}
			return rows[i].id < rows[j].id
		})
		if count > len(rows) {
			count = len(rows)
		}
		parts := make([]string, 0, count)
		for _, row := range rows[:count] {
			parts = append(parts, row.id+"("+strconv.Itoa(row.time)+")")
		}
		return strings.Join(parts, ",")
	}

	for _, query := range queries {
		switch query[0] {
		case "ADD_WORKER":
			id := query[1]
			position := query[2]
			compensation, _ := strconv.Atoi(query[3])
			if _, exists := workers[id]; exists {
				out = append(out, "false")
			} else {
				workers[id] = &worker{
					position:           position,
					compensation:       compensation,
					activePosition:     position,
					activeCompensation: compensation,
					timeByPosition:     map[string]int{},
					sessions:           []session{},
				}
				out = append(out, "true")
			}
		case "REGISTER":
			current := workers[query[1]]
			timestamp, _ := strconv.Atoi(query[2])
			if current == nil {
				out = append(out, "invalid_request")
			} else if current.insideSince == nil {
				applyPendingOnEntry(current, timestamp)
				start := timestamp
				current.insideSince = &start
				current.activePosition = current.position
				current.activeCompensation = current.compensation
				out = append(out, "registered")
			} else {
				addSession(current, *current.insideSince, timestamp)
				current.insideSince = nil
				out = append(out, "registered")
			}
		case "GET":
			current := workers[query[1]]
			if current == nil {
				out = append(out, "")
			} else {
				out = append(out, strconv.Itoa(current.totalTime))
			}
		case "TOP_N_WORKERS":
			count, _ := strconv.Atoi(query[1])
			out = append(out, topWorkers(count, query[2]))
		case "PROMOTE":
			current := workers[query[1]]
			if current == nil || current.pending != nil {
				out = append(out, "invalid_request")
			} else {
				compensation, _ := strconv.Atoi(query[3])
				start, _ := strconv.Atoi(query[4])
				current.pending = &pendingPromotion{position: query[2], compensation: compensation, start: start}
				out = append(out, "success")
			}
		case "CALC_SALARY":
			current := workers[query[1]]
			if current == nil {
				out = append(out, "")
			} else {
				start, _ := strconv.Atoi(query[2])
				end, _ := strconv.Atoi(query[3])
				out = append(out, strconv.Itoa(calcSalary(current, start, end)))
			}
		case "SET_DOUBLE_PAY":
			start, _ := strconv.Atoi(query[1])
			end, _ := strconv.Atoi(query[2])
			if start >= end {
				out = append(out, "false")
			} else {
				doublePay = append(doublePay, interval{start: start, end: end})
				out = append(out, "true")
			}
		default:
			out = append(out, "")
		}
	}

	return out
}

func minInt(a int, b int) int {
	if a < b {
		return a
	}
	return b
}

func maxInt(a int, b int) int {
	if a > b {
		return a
	}
	return b
}
