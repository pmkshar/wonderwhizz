import 'package:flutter/material.dart';

import '../models/models.dart';

class MathsTopicSelector extends StatelessWidget {
  final String? value;
  final ValueChanged<String?> onChanged;

  const MathsTopicSelector({
    super.key,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: MATHS_TOPICS.map((t) {
        final active = t.id == value;
        return GestureDetector(
          onTap: () => onChanged(active ? null : t.id),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            width: 145,
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: active
                    ? Theme.of(context).colorScheme.primary
                    : Colors.black12,
                width: active ? 2 : 1,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        gradient: gradientFromHex(t.gradient),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      alignment: Alignment.center,
                      child: Text(t.emoji, style: const TextStyle(fontSize: 14)),
                    ),
                    const Spacer(),
                    Text(
                      t.grades,
                      style: const TextStyle(fontSize: 9, color: Colors.black54),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  t.label,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                ),
                const SizedBox(height: 2),
                Text(
                  t.description,
                  style: const TextStyle(fontSize: 10, color: Colors.black54),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }
}
