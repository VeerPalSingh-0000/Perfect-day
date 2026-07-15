import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../state/providers/auth_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/services/push_notification_service.dart';
import '../../core/services/haptic_service.dart';
import 'widgets/settings_section.dart';
import 'widgets/achievement_badge.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  bool _isAvatarDropdownOpen = false;
  bool _isDarkMode = true;
  bool _isPushEnabled = false;
  bool _isAdvancedMode = false;
  bool _isHapticsEnabled = true;

  @override
  void initState() {
    super.initState();
    _loadPreferences();
  }

  Future<void> _loadPreferences() async {
    final pushEnabled = await ref.read(pushNotificationServiceProvider).isEnabled;
    final hapticsEnabled = await ref.read(hapticServiceProvider).isEnabled;
    if (mounted) {
      setState(() {
        _isPushEnabled = pushEnabled;
        _isHapticsEnabled = hapticsEnabled;
      });
    }
  }

  final List<String> _avatars = [
    'assets/avatars/avatar1.webp',
    'assets/avatars/avatar2.webp',
    'assets/avatars/avatar3.webp',
    'assets/avatars/avatar4.webp',
    'assets/avatars/avatar5.webp',
  ];

  String _currentAvatar = 'assets/avatars/avatar1.webp';

  final List<Map<String, dynamic>> _achievements = [
    {'id': 'first_perfect', 'title': 'Perfect Day', 'icon': '🌟', 'desc': 'Finish 100% of tasks', 'unlocked': true},
    {'id': 'streak_7', 'title': 'Relentless', 'icon': '🔥', 'desc': '7-day streak', 'unlocked': false},
    {'id': 'streak_30', 'title': 'Unstoppable', 'icon': '💎', 'desc': '30-day streak', 'unlocked': false},
    {'id': 'tasks_100', 'title': 'Century', 'icon': '🏆', 'desc': '100 tasks completed', 'unlocked': false},
    {'id': 'early_bird', 'title': 'Early Bird', 'icon': '🐦', 'desc': 'Finish before noon', 'unlocked': true},
  ];

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authStateProvider).value;

    return Scaffold(
      backgroundColor: Colors.black,
      body: LayoutBuilder(
        builder: (context, constraints) {
          final isDesktop = constraints.maxWidth > 800;
          return SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 1200),
                child: Flex(
                  direction: isDesktop ? Axis.horizontal : Axis.vertical,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Left Column
                    Expanded(
                      flex: isDesktop ? 1 : 0,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildAccountProfile(user),
                          const SizedBox(height: 32),
                          _buildDigitalIdentity(),
                          const SizedBox(height: 32),
                          _buildSystemPreferences(),
                        ],
                      ),
                    ),
                    if (isDesktop) const SizedBox(width: 32),
                    if (!isDesktop) const SizedBox(height: 32),
                    // Right Column
                    Expanded(
                      flex: isDesktop ? 1 : 0,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildAchievements(),
                          const SizedBox(height: 32),
                          _buildTaskConfiguration(),
                          const SizedBox(height: 32),
                          _buildTargetCompletion(),
                          const SizedBox(height: 32),
                          _buildCoreSystem(),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildAccountProfile(dynamic user) {
    return SettingsSection(
      title: 'ACCOUNT PROFILE',
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            Row(
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.brand.withValues(alpha: 0.4), width: 2),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.brand.withValues(alpha: 0.15),
                        blurRadius: 10,
                        spreadRadius: 4,
                      ),
                    ],
                  ),
                  child: ClipOval(
                    child: Container(
                      color: Colors.black,
                      child: const Icon(Icons.person, size: 40, color: AppColors.brandLight), // Mock avatar
                    ),
                  ),
                ),
                const SizedBox(width: 20),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              user?.email?.split('@').first ?? 'Sira Architect',
                              style: const TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                                letterSpacing: -0.5,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.brand.withValues(alpha: 0.1),
                              border: Border.all(color: AppColors.brand.withValues(alpha: 0.3)),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Text(
                              'ARCHITECT',
                              style: TextStyle(
                                fontSize: 8,
                                fontWeight: FontWeight.bold,
                                color: AppColors.brandLight,
                                letterSpacing: 2.0,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        user?.email ?? 'anonymous@sira.app',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textMuted,
                          letterSpacing: 1.0,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            InkWell(
              onTap: () => signOut(ref),
              borderRadius: BorderRadius.circular(8),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  color: const Color(0xFF141416).withValues(alpha: 0.6),
                  border: Border.all(color: AppColors.textMuted.withValues(alpha: 0.2)),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.logout, size: 16, color: Colors.red.shade400),
                    const SizedBox(width: 8),
                    const Text(
                      'SIGN OUT SECURELY',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w900,
                        color: AppColors.textMuted,
                        letterSpacing: 2.0,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDigitalIdentity() {
    return SettingsSection(
      title: 'DIGITAL IDENTITY',
      child: Column(
        children: [
          SettingsTile(
            icon: const SizedBox(width: 36, height: 36), // Placeholder for alignment
            title: 'Avatar Configuration',
            subtitle: 'Choose your visual presence across Sira',
            trailing: Icon(
              _isAvatarDropdownOpen ? Icons.expand_less : Icons.expand_more,
              color: AppColors.textMuted,
            ),
            onTap: () {
              setState(() {
                _isAvatarDropdownOpen = !_isAvatarDropdownOpen;
              });
            },
          ),
          if (_isAvatarDropdownOpen)
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: _avatars.map((avatar) {
                  final isSelected = _currentAvatar == avatar;
                  return GestureDetector(
                    onTap: () {
                      setState(() {
                        _currentAvatar = avatar;
                      });
                    },
                    child: Container(
                      width: 50,
                      height: 50,
                      decoration: BoxDecoration(
                        color: Colors.black,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isSelected ? AppColors.brand : Colors.transparent,
                          width: 2,
                        ),
                        boxShadow: isSelected
                            ? [
                                BoxShadow(
                                  color: AppColors.brand.withValues(alpha: 0.4),
                                  blurRadius: 10,
                                )
                              ]
                            : null,
                      ),
                      child: Stack(
                        children: [
                          Center(
                            child: Icon(
                              Icons.person,
                              color: isSelected ? AppColors.brandLight : Colors.grey.withValues(alpha: 0.5),
                            ),
                          ),
                          if (isSelected)
                            Positioned(
                              top: 2,
                              right: 2,
                              child: Container(
                                padding: const EdgeInsets.all(2),
                                decoration: const BoxDecoration(
                                  color: AppColors.brand,
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.check, size: 8, color: Colors.white),
                              ),
                            ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildSystemPreferences() {
    return SettingsSection(
      title: 'SYSTEM PREFERENCES',
      child: Column(
        children: [
          SettingsTile(
            icon: _buildIconBox(
              icon: _isDarkMode ? Icons.dark_mode : Icons.light_mode,
              color: _isDarkMode ? Colors.purple : Colors.grey,
            ),
            title: 'Appearance',
            subtitle: _isDarkMode ? 'Dark theme active' : 'Light theme active',
            trailing: _buildSwitch(_isDarkMode),
            onTap: () {
              setState(() {
                _isDarkMode = !_isDarkMode;
              });
            },
          ),
          const Divider(height: 1, color: Colors.white10),
          SettingsTile(
            icon: _buildIconBox(
              icon: Icons.notifications,
              color: _isPushEnabled ? Colors.cyan : Colors.grey,
            ),
            title: 'Push Delivery',
            subtitle: _isPushEnabled ? 'Alerts enabled' : 'Reminders only',
            trailing: _buildSwitch(_isPushEnabled),
            onTap: () async {
              final haptic = ref.read(hapticServiceProvider);
              await haptic.selection();
              
              final pushService = ref.read(pushNotificationServiceProvider);
              final newValue = !_isPushEnabled;
              // Optimistic UI update
              setState(() {
                _isPushEnabled = newValue;
              });
              
              final success = await pushService.togglePushNotifications(newValue);
              if (!success && mounted) {
                // Revert if failed
                setState(() {
                  _isPushEnabled = !newValue;
                });
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Failed to update push settings or permission denied')),
                );
              }
            },
          ),
          if (_isPushEnabled) ...[
            const Divider(height: 1, color: Colors.white10),
            SettingsTile(
              icon: _buildIconBox(
                icon: Icons.send,
                color: Colors.cyan,
              ),
              title: 'Send Test Push',
              subtitle: 'Verify connection to this device',
              trailing: const Icon(Icons.chevron_right, color: AppColors.textMuted),
              onTap: () {
                // Handle test push
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Test push initiated')),
                );
              },
            ),
          ]
        ],
      ),
    );
  }

  Widget _buildAchievements() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.only(left: 8.0, bottom: 12.0),
          child: Text(
            'ACHIEVEMENTS & MILESTONES',
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              letterSpacing: 2.0,
              color: AppColors.textMuted,
            ),
          ),
        ),
        SizedBox(
          height: 120,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: _achievements.length,
            itemBuilder: (context, index) {
              final ach = _achievements[index];
              return AchievementBadge(
                id: ach['id'],
                title: ach['title'],
                icon: ach['icon'],
                desc: ach['desc'],
                isUnlocked: ach['unlocked'],
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildTaskConfiguration() {
    return SettingsSection(
      title: 'TASK CONFIGURATION',
      child: SettingsTile(
        icon: _buildIconBox(
          icon: Icons.stars,
          color: _isAdvancedMode ? Colors.purple : Colors.grey,
        ),
        title: _isAdvancedMode ? 'Advanced Mode' : 'Basic Mode',
        subtitle: _isAdvancedMode ? 'Tasks carry varying priority weights' : 'All tasks carry equal importance',
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            IconButton(
              icon: const Icon(Icons.info_outline, size: 16, color: Colors.white70),
              onPressed: () {
                // Show info
              },
            ),
            _buildSwitch(_isAdvancedMode),
          ],
        ),
        onTap: () {
          setState(() {
            _isAdvancedMode = !_isAdvancedMode;
          });
        },
      ),
    );
  }

  Widget _buildTargetCompletion() {
    return SettingsSection(
      title: 'TARGET COMPLETION',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'ACTIVE LEARNING CYCLES',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.0,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'STRATEGIC OBJECTIVES AND PROGRESS TRACKING',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    letterSpacing: 0.5,
                    color: AppColors.textMuted,
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: Colors.white10),
          Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              children: [
                const Text(
                  'NO ACTIVE TARGETS FOUND',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    fontStyle: FontStyle.italic,
                    letterSpacing: 2.0,
                    color: AppColors.textMuted,
                  ),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () {},
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.brand.withValues(alpha: 0.1),
                    foregroundColor: AppColors.brandLight,
                    side: BorderSide(color: AppColors.brand.withValues(alpha: 0.35)),
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    textStyle: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 2.0,
                    ),
                  ),
                  child: const Text('INITIALIZE FIRST TARGET'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCoreSystem() {
    return SettingsSection(
      title: 'CORE SYSTEM',
      child: SettingsTile(
        icon: _buildIconBox(
          icon: Icons.vibration,
          color: _isHapticsEnabled ? Colors.green : Colors.grey,
        ),
        title: 'Tactical Haptics',
        subtitle: _isHapticsEnabled ? 'System vibrations active' : 'Tactile feedback disabled',
        trailing: _buildSwitch(_isHapticsEnabled),
        onTap: () async {
              final haptic = ref.read(hapticServiceProvider);
              final newValue = !_isHapticsEnabled;
              setState(() {
                _isHapticsEnabled = newValue;
              });
              await haptic.toggleHaptics(newValue);
            },
      ),
    );
  }

  Widget _buildIconBox({required IconData icon, required MaterialColor color}) {
    return Container(
      width: 36,
      height: 36,
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        border: Border.all(color: color.withValues(alpha: 0.35)),
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: color.withValues(alpha: 0.3),
            blurRadius: 8,
          ),
        ],
      ),
      child: Center(
        child: Icon(icon, color: color.shade300, size: 16),
      ),
    );
  }

  Widget _buildSwitch(bool value) {
    return Container(
      width: 40,
      height: 20,
      decoration: BoxDecoration(
        color: value ? AppColors.brand : Colors.white24,
        borderRadius: BorderRadius.circular(10),
        boxShadow: value
            ? [
                BoxShadow(
                  color: AppColors.brand.withValues(alpha: 0.3),
                  blurRadius: 10,
                )
              ]
            : null,
      ),
      child: AnimatedAlign(
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeInOut,
        alignment: value ? Alignment.centerRight : Alignment.centerLeft,
        child: Container(
          width: 12,
          height: 12,
          margin: const EdgeInsets.symmetric(horizontal: 4),
          decoration: const BoxDecoration(
            color: Colors.white,
            shape: BoxShape.circle,
          ),
        ),
      ),
    );
  }
}
