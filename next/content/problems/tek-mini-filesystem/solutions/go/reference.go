package solution

import (
	"sort"
	"strings"
)

func RunFs(commands [][]any) []any {
	root := &node{children: map[string]*node{}}
	parts := func(path string) []string {
		out := []string{}
		for _, part := range strings.Split(path, "/") {
			if part != "" {
				out = append(out, part)
			}
		}
		return out
	}
	var nodeAt func([]string, bool) *node
	nodeAt = func(segs []string, create bool) *node {
		cur := root
		for _, seg := range segs {
			if cur.children == nil {
				return nil
			}
			next := cur.children[seg]
			if next == nil {
				if !create {
					return nil
				}
				next = &node{children: map[string]*node{}}
				cur.children[seg] = next
			}
			cur = next
		}
		return cur
	}
	out := []any{}
	for _, cmd := range commands {
		switch asString(cmd[0]) {
		case "mkdir":
			nodeAt(parts(asString(cmd[1])), true)
		case "addFile":
			segs := parts(asString(cmd[1]))
			parent := nodeAt(segs[:len(segs)-1], true)
			parent.children[segs[len(segs)-1]] = &node{content: asString(cmd[2])}
		case "ls":
			segs := parts(asString(cmd[1]))
			cur := nodeAt(segs, false)
			if cur.children == nil {
				out = append(out, []string{segs[len(segs)-1]})
			} else {
				names := make([]string, 0, len(cur.children))
				for name := range cur.children {
					names = append(names, name)
				}
				sort.Strings(names)
				out = append(out, names)
			}
		case "cat":
			out = append(out, nodeAt(parts(asString(cmd[1])), false).content)
		case "rm":
			segs := parts(asString(cmd[1]))
			if len(segs) > 0 {
				parent := nodeAt(segs[:len(segs)-1], false)
				if parent != nil && parent.children != nil {
					delete(parent.children, segs[len(segs)-1])
				}
			}
		}
	}
	return out
}

type node struct {
	children map[string]*node
	content  string
}

func asString(value any) string {
	if s, ok := value.(string); ok {
		return s
	}
	return ""
}
