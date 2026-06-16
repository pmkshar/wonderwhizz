import 'package:flutter/material.dart';

import '../models/models.dart';

class SubjectSelector extends StatelessWidget {
  final String value;
  final ValueChanged<String> onChanged;

  const SubjectSelector({super.key, required this.value, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final crossAxisCount = constraints.maxWidth > 600 ? 4 : 2;
        return GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: crossAxisCount,
            mainAxisSpacing: 10,
            crossAxisSpacing: 10,
            childAspectRatio: 1.0,
          ),
          itemCount: SUBJECTS.length,
          itemBuilder: (context, i) {
            final s = SUBJECTS[i];
            final active = s.id == value;
            return GestureDetector(
              onTap: () => onChanged(s.id),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: active ? Theme.of(context).colorScheme.primary : Colors.black12,
                    width: active ? 2 : 1,
                  ),
                ),
                padding: const EdgeInsets.all(8),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        gradient: gradientFromHex(s.gradient),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      alignment: Alignment.center,
                      child: Text(s.emoji, style: const TextStyle(fontSize: 26)),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      s.label,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      s.description,
                      textAlign: TextAlign.center,
                      style: const TextStyle(fontSize: 10, color: Colors.black54),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }
}
