import { python, pythonLanguage } from "@codemirror/lang-python";
import { EditorView, keymap, type KeyBinding } from "@codemirror/view";
import { indentUnit } from "@codemirror/language";
import { EditorState, type Extension } from "@codemirror/state";
import { pythonJediCompletion, pythonStdlibCompletion } from "../../runner/pythonCompletions";

/**
 * The CodeMirror extension stack shared by every Python editor in the app
 * (problem workspace, scratchpad, timed assessment). Centralised so the
 * language config, 4-space indent, and the two-tier autocomplete (instant
 * stdlib + Jedi) stay identical everywhere; callers supply only the
 * accessibility label and their own run keybindings.
 */
export function pythonEditorExtensions(options: {
  ariaLabel: string;
  keys?: readonly KeyBinding[];
}): Extension[] {
  return [
    python(),
    indentUnit.of("    "),
    EditorState.tabSize.of(4),
    pythonLanguage.data.of({ autocomplete: pythonStdlibCompletion }),
    pythonLanguage.data.of({ autocomplete: pythonJediCompletion }),
    EditorView.contentAttributes.of({ "aria-label": options.ariaLabel }),
    keymap.of([...(options.keys ?? [])])
  ];
}
