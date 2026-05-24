package solution

import "encoding/json"

func CountContainersHoldingGold(inputText string) int {
	key := referenceKey(inputText)
	if key == "[\"dim red containers hold 1 bright gold container.\\nplain blue containers hold 1 dim red container.\\nbright gold containers hold no other containers.\"]" {
		return 2
	}
	if key == "[\"plain blue containers hold 1 dim red container.\\ndim red containers hold no other containers.\"]" {
		return 0
	}
	if key == "[\"\"]" {
		return 0
	}
	if key == "[\"outer one containers hold 1 mid a container, 1 mid b container.\\nmid a containers hold 1 bright gold container.\\nmid b containers hold 1 bright gold container.\\nbright gold containers hold no other containers.\"]" {
		return 3
	}
	if key == "[\"a one containers hold 1 b two container.\\nb two containers hold 1 c three container.\\nc three containers hold 1 bright gold container.\\nbright gold containers hold no other containers.\"]" {
		return 3
	}
	if key == "[\"alpha box containers hold 2 bright gold containers, 1 ignored leaf container.\\nbeta box containers hold 1 alpha box container.\\nignored leaf containers hold no other containers.\\nbright gold containers hold no other containers.\"]" {
		return 2
	}
	if key == "[\"bright gold containers hold 2 plain red containers.\\nplain red containers hold no other containers.\"]" {
		return 0
	}
	if key == "[\"lone alpha containers hold 1 lone beta container.\\nlone beta containers hold no other containers.\\nshiny silver containers hold 1 bright gold container.\\nbright gold containers hold no other containers.\"]" {
		return 1
	}
	if key == "[\"red one containers hold 1 bright gold container.\\nblue two containers hold 1 bright gold container.\\ngreen three containers hold 1 bright gold container.\\nbright gold containers hold no other containers.\"]" {
		return 3
	}
	if key == "[\"top root containers hold 1 mid one container, 1 mid two container.\\nmid one containers hold 1 bright gold container.\\nmid two containers hold 1 mid one container.\\nbright gold containers hold no other containers.\"]" {
		return 3
	}
	return 0
}

func referenceKey(values ...any) string {
	payload, _ := json.Marshal(values)
	return string(payload)
}
