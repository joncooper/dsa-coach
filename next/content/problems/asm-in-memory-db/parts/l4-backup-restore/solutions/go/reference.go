package solution

import (
	"sort"
	"strconv"
	"strings"
)

type fieldKey struct {
	key   string
	field string
}

type fieldRow struct {
	field string
	value string
}

type backup struct {
	store map[string]map[string]string
	ttls  map[fieldKey]int
}

func Solution(queries [][]string) []string {
	store := map[string]map[string]string{}
	ttls := map[fieldKey]int{}
	backups := map[string]backup{}
	out := []string{}
	backupSeq := 0

	alive := func(key, field string, timestamp int) bool {
		fields := store[key]
		if fields == nil {
			return false
		}
		if _, exists := fields[field]; !exists {
			return false
		}
		exp, hasTTL := ttls[fieldKey{key, field}]
		return !hasTTL || timestamp < exp
	}

	deleteField := func(key, field string) {
		if fields := store[key]; fields != nil {
			delete(fields, field)
			if len(fields) == 0 {
				delete(store, key)
			}
		}
		delete(ttls, fieldKey{key, field})
	}

	liveRows := func(key string, timestamp int, prefix string) []fieldRow {
		rows := []fieldRow{}
		for field, value := range store[key] {
			if strings.HasPrefix(field, prefix) && alive(key, field, timestamp) {
				rows = append(rows, fieldRow{field, value})
			}
		}
		return rows
	}

	for _, query := range queries {
		timestamp, _ := strconv.Atoi(query[1])
		switch query[0] {
		case "SET":
			key, field, value := query[2], query[3], query[4]
			if store[key] == nil {
				store[key] = map[string]string{}
			}
			store[key][field] = value
			delete(ttls, fieldKey{key, field})
			out = append(out, "true")
		case "SET_AT":
			key, field, value := query[2], query[3], query[4]
			ttl, _ := strconv.Atoi(query[5])
			if store[key] == nil {
				store[key] = map[string]string{}
			}
			store[key][field] = value
			ttls[fieldKey{key, field}] = timestamp + ttl
			out = append(out, "true")
		case "GET":
			if alive(query[2], query[3], timestamp) {
				out = append(out, store[query[2]][query[3]])
			} else {
				out = append(out, "")
			}
		case "DELETE":
			if alive(query[2], query[3], timestamp) {
				deleteField(query[2], query[3])
				out = append(out, "true")
			} else {
				out = append(out, "false")
			}
		case "SCAN":
			out = append(out, renderFields(liveRows(query[2], timestamp, "")))
		case "SCAN_BY_PREFIX":
			out = append(out, renderFields(liveRows(query[2], timestamp, query[3])))
		case "BACKUP":
			backupSeq++
			id := "backup" + strconv.Itoa(backupSeq)
			snapStore := map[string]map[string]string{}
			snapTTLs := map[fieldKey]int{}
			for key, fields := range store {
				live := map[string]string{}
				for field, value := range fields {
					if !alive(key, field, timestamp) {
						continue
					}
					live[field] = value
					pair := fieldKey{key, field}
					if exp, ok := ttls[pair]; ok {
						snapTTLs[pair] = exp
					}
				}
				if len(live) > 0 {
					snapStore[key] = live
				}
			}
			backups[id] = backup{store: snapStore, ttls: snapTTLs}
			out = append(out, id)
		case "RESTORE":
			snap, exists := backups[query[2]]
			if !exists {
				out = append(out, "false")
				continue
			}
			store = cloneStore(snap.store)
			ttls = cloneTTLs(snap.ttls)
			for pair, exp := range cloneTTLs(ttls) {
				if exp <= timestamp {
					deleteField(pair.key, pair.field)
				}
			}
			out = append(out, "true")
		default:
			out = append(out, "")
		}
	}

	return out
}

func cloneStore(source map[string]map[string]string) map[string]map[string]string {
	cloned := map[string]map[string]string{}
	for key, fields := range source {
		cloned[key] = map[string]string{}
		for field, value := range fields {
			cloned[key][field] = value
		}
	}
	return cloned
}

func cloneTTLs(source map[fieldKey]int) map[fieldKey]int {
	cloned := map[fieldKey]int{}
	for pair, expiresAt := range source {
		cloned[pair] = expiresAt
	}
	return cloned
}

func renderFields(rows []fieldRow) string {
	sort.Slice(rows, func(i, j int) bool { return rows[i].field < rows[j].field })
	parts := make([]string, 0, len(rows))
	for _, row := range rows {
		parts = append(parts, row.field+"="+row.value)
	}
	return strings.Join(parts, ",")
}
