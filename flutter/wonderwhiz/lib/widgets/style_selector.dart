import 'package:flutter/material.dart';

import '../models/models.dart';

class StyleSelector extends StatelessWidget {
  final String value;
  final ValueChanged<String> onChanged;

  const StyleSelector({super.key, required this.value, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        for (final s in EXPLANATION_STYLES)
          GestureDetector(
            onTap: () => onChanged(s.id),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 150),
              width: 150,
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: s.id == value
                      ? Theme.of(context).colorScheme.primary
                      : Colors.black12,
                  width: s.id == value ? 2 : 1,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      gradient: gradientFromHex(s.gradient),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    alignment: Alignment.center,
                    child: Text(s.emoji, style: const TextStyle(fontSize: 16)),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    s.label,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    s.description,
                    style: const TextStyle(fontSize: 10, color: Colors.black54),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }
}
