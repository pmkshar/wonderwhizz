import 'package:flutter/material.dart';

import '../models/models.dart';

/// A draggable-bottom-sheet style math keyboard.
/// Insert symbols into the parent [controller].
class MathKeyboardSheet extends StatefulWidget {
  final TextEditingController controller;
  final VoidCallback? onSubmit;

  const MathKeyboardSheet({
    super.key,
    required this.controller,
    this.onSubmit,
  });

  @override
  State<MathKeyboardSheet> createState() => _MathKeyboardSheetState();
}

class _MathKeyboardSheetState extends State<MathKeyboardSheet> {
  String _activePad = 'basic';

  void _insert(String symbol) {
    final text = widget.controller.text;
    final sel = widget.controller.selection;
    final start = sel.start >= 0 ? sel.start : text.length;
    final end = sel.end >= 0 ? sel.end : text.length;
    final newText = text.substring(0, start) + symbol + text.substring(end);
    widget.controller.text = newText;
    final newCursor = start + symbol.length;
    widget.controller.selection =
        TextSelection.collapsed(offset: newCursor);
  }

  @override
  Widget build(BuildContext context) {
    final pad = MATH_KEY_PADS.firstWhere(
      (p) => p.id == _activePad,
      orElse: () => MATH_KEY_PADS.first,
    );
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        border: Border.all(color: Colors.black.withOpacity(0.08)),
      ),
      padding: const EdgeInsets.all(12),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text('🧮 Math Keyboard',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              const Spacer(),
              IconButton(
                icon: const Icon(Icons.check, color: Colors.green),
                onPressed: () => Navigator.of(context).pop(),
                tooltip: 'Done',
              ),
            ],
          ),
          const SizedBox(height: 8),
          // Pad tabs
          SizedBox(
            height: 36,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: MATH_KEY_PADS.map((p) {
                final active = p.id == _activePad;
                return Padding(
                  padding: const EdgeInsets.only(right: 6),
                  child: GestureDetector(
                    onTap: () => setState(() => _activePad = p.id),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        gradient: active ? gradientFromHex(p.gradient) : null,
                        color: active ? null : Colors.black.withOpacity(0.05),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        p.title,
                        style: TextStyle(
                          color: active ? Colors.white : Colors.black87,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 12),
          // Keys grid
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 6,
              mainAxisSpacing: 6,
              crossAxisSpacing: 6,
              childAspectRatio: 1.1,
            ),
            itemCount: pad.keys.length,
            itemBuilder: (context, i) {
              final k = pad.keys[i];
              return ElevatedButton(
                onPressed: () => _insert(k.symbol),
                style: ElevatedButton.styleFrom(
                  padding: EdgeInsets.zero,
                  backgroundColor: Colors.white,
                  foregroundColor: Colors.black,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                    side: BorderSide(color: Colors.black.withOpacity(0.1)),
                  ),
                ),
                child: Text(
                  k.label,
                  style: const TextStyle(
                    fontSize: 16,
                    fontFamily: 'monospace',
                    fontWeight: FontWeight.w500,
                  ),
                ),
              );
            },
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              IconButton(
                onPressed: () {
                  final text = widget.controller.text;
                  if (text.isEmpty) return;
                  final sel = widget.controller.selection;
                  final start = sel.start >= 0 ? sel.start : text.length;
                  final end = sel.end >= 0 ? sel.end : text.length;
                  final realStart = start == end ? (start - 1).clamp(0, text.length) : start;
                  widget.controller.text =
                      text.substring(0, realStart) + text.substring(end);
                  widget.controller.selection =
                      TextSelection.collapsed(offset: realStart);
                },
                icon: const Icon(Icons.backspace_outlined),
                tooltip: 'Backspace',
              ),
              IconButton(
                onPressed: () => widget.controller.clear(),
                icon: const Icon(Icons.clear, color: Colors.red),
                tooltip: 'Clear',
              ),
              const Spacer(),
              if (widget.onSubmit != null)
                FilledButton.icon(
                  onPressed: widget.onSubmit,
                  icon: const Icon(Icons.auto_awesome),
                  label: const Text('Ask'),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

/// Shows the math keyboard as a modal bottom sheet.
void showMathKeyboard(
  BuildContext context, {
  required TextEditingController controller,
  VoidCallback? onSubmit,
}) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) => Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: MathKeyboardSheet(controller: controller, onSubmit: onSubmit),
    ),
  );
}
