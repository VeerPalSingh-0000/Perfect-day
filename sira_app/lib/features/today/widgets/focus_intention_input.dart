import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';

class FocusIntentionInput extends StatefulWidget {
  final String initialValue;
  final ValueChanged<String>? onChanged;

  const FocusIntentionInput({
    super.key,
    this.initialValue = '',
    this.onChanged,
  });

  @override
  State<FocusIntentionInput> createState() => _FocusIntentionInputState();
}

class _FocusIntentionInputState extends State<FocusIntentionInput> {
  late TextEditingController _controller;
  final FocusNode _focusNode = FocusNode();
  bool _isFocused = false;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.initialValue);
    _focusNode.addListener(() {
      setState(() {
        _isFocused = _focusNode.hasFocus;
      });
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: _isFocused ? AppColors.brandLight.withValues(alpha: 0.25) : Colors.white.withValues(alpha: 0.05),
        ),
        boxShadow: _isFocused
            ? [
                BoxShadow(
                  color: AppColors.brandLight.withValues(alpha: 0.05),
                  blurRadius: 20,
                  offset: const Offset(0, 4),
                )
              ]
            : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.adjust,
                size: 12,
                color: _isFocused ? AppColors.brandLight.withValues(alpha: 0.7) : AppColors.brandLight.withValues(alpha: 0.3),
              ),
              const SizedBox(width: 6),
              AnimatedDefaultTextStyle(
                duration: const Duration(milliseconds: 300),
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 2.0,
                  color: _isFocused ? AppColors.brandLight : AppColors.textMuted,
                ),
                child: const Text('FOCUS INTENTION'),
              ),
            ],
          ),
          const SizedBox(height: 8),
          TextField(
            controller: _controller,
            focusNode: _focusNode,
            onChanged: widget.onChanged,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
            decoration: InputDecoration(
              isDense: true,
              contentPadding: EdgeInsets.zero,
              hintText: 'Set your daily intention...',
              hintStyle: const TextStyle(
                color: AppColors.textMuted,
              ),
              border: InputBorder.none,
              enabledBorder: InputBorder.none,
              focusedBorder: InputBorder.none,
            ),
          ),
        ],
      ),
    );
  }
}
