import 'package:flutter/material.dart';

import '../models/models.dart';

class VoicePicker extends StatelessWidget {
  final String value;
  final ValueChanged<String> onChanged;

  const VoicePicker({super.key, required this.value, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        for (final v in VOICES)
          GestureDetector(
            onTap: () => onChanged(v.id),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 150),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: v.id == value
                    ? Theme.of(context).colorScheme.primary.withOpacity(0.12)
                    : Colors.white,
                borderRadius: BorderRadius.circular(999),
                border: Border.all(
                  color: v.id == value
                      ? Theme.of(context).colorScheme.primary
                      : Colors.black12,
                  width: v.id == value ? 2 : 1,
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(v.flag, style: const TextStyle(fontSize: 16)),
                  const SizedBox(width: 6),
                  Text(
                    v.nativeLabel,
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: v.id == value
                          ? Theme.of(context).colorScheme.primary
                          : Colors.black87,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '(${v.label})',
                    style: const TextStyle(fontSize: 11, color: Colors.black54),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }
}
