import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../state/providers/auth_provider.dart';
import '../../features/today/today_screen.dart';
import '../../features/habits/habits_screen.dart';
import '../../features/targets/targets_screen.dart';
import '../../features/landing/landing_screen.dart';
import '../../features/auth/auth_screen.dart';
import '../../features/profile/profile_screen.dart';
import '../../features/history/history_screen.dart';
import '../../features/analytics/analytics_screen.dart';
import '../../core/theme/app_colors.dart';
import '../../core/services/day_record_service.dart';
import '../../core/services/focus_sync_service.dart';

// Keys will be created inside the provider to avoid duplicate GlobalKey errors on Hot Reload

class MainScaffold extends ConsumerWidget {
  final Widget child;
  const MainScaffold({super.key, required this.child});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Keep global services alive
    ref.watch(dayRecordServiceProvider);
    ref.watch(focusSyncServiceProvider);
    
    final location = GoRouterState.of(context).uri.path;
    
    // Determine title based on location
    String title = 'Sira';
    if (location.startsWith('/history')) { title = 'Journey'; }
    else if (location.startsWith('/profile')) { title = 'Profile'; }
    else if (location.startsWith('/habits')) { title = 'Habits'; }
    else if (location.startsWith('/targets')) { title = 'Targets'; }
    else if (location.startsWith('/analytics')) { title = 'Stats'; }

    return Scaffold(
      appBar: AppBar(
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w900)),
        centerTitle: true,
        actions: [
          PopupMenuButton<String>(
            icon: const Icon(Icons.menu),
            color: AppColors.surface,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(color: AppColors.border, width: 1),
            ),
            onSelected: (value) {
              if (value == 'signout') {
                signOut(ref);
              } else {
                context.go(value);
              }
            },
            itemBuilder: (BuildContext context) => <PopupMenuEntry<String>>[
              const PopupMenuItem<String>(
                value: '/analytics',
                child: ListTile(
                  leading: Icon(Icons.bar_chart, color: AppColors.textPrimary),
                  title: Text('Stats', style: TextStyle(color: AppColors.textPrimary)),
                  contentPadding: EdgeInsets.zero,
                ),
              ),
              const PopupMenuItem<String>(
                value: '/habits',
                child: ListTile(
                  leading: Icon(Icons.event_repeat, color: AppColors.textPrimary),
                  title: Text('Habits', style: TextStyle(color: AppColors.textPrimary)),
                  contentPadding: EdgeInsets.zero,
                ),
              ),
              const PopupMenuItem<String>(
                value: '/targets',
                child: ListTile(
                  leading: Icon(Icons.flag, color: AppColors.textPrimary),
                  title: Text('Targets', style: TextStyle(color: AppColors.textPrimary)),
                  contentPadding: EdgeInsets.zero,
                ),
              ),
              const PopupMenuDivider(),
              const PopupMenuItem<String>(
                value: 'signout',
                child: ListTile(
                  leading: Icon(Icons.logout, color: AppColors.error),
                  title: Text('Sign Out', style: TextStyle(color: AppColors.error)),
                  contentPadding: EdgeInsets.zero,
                ),
              ),
            ],
          ),
        ],
      ),
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _calculateSelectedIndex(context),
        onDestinationSelected: (int idx) => _onItemTapped(idx, context),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home), label: 'Focus'),
          NavigationDestination(icon: Icon(Icons.explore), label: 'Journey'),
          NavigationDestination(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }

  static int _calculateSelectedIndex(BuildContext context) {
    final String location = GoRouterState.of(context).uri.path;
    if (location.startsWith('/history')) { return 1; }
    if (location.startsWith('/profile')) { return 2; }
    return 0; // default to Focus/Today
  }

  void _onItemTapped(int index, BuildContext context) {
    switch (index) {
      case 0:
        context.go('/');
        break;
      case 1:
        context.go('/history');
        break;
      case 2:
        context.go('/profile');
        break;
    }
  }
}

final _rootNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'root');
final _shellNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'shell');

final goRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/',
    redirect: (context, state) {
      // --- BYPASS AUTHENTICATION FOR UI TESTING ---
      // We are skipping the auth check so you can view the UI without logging in.
      
      final isGoingToLanding = state.uri.path == '/landing';
      final isGoingToAuth = state.uri.path == '/auth';

      // If they are on auth/landing but want to see the app, send them to home
      if (isGoingToLanding || isGoingToAuth) {
        return '/';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/landing',
        builder: (context, state) => const LandingScreen(),
      ),
      GoRoute(
        path: '/auth',
        builder: (context, state) => const AuthScreen(),
      ),
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (context, state, child) {
          return MainScaffold(child: child);
        },
        routes: [
          GoRoute(
            path: '/',
            builder: (context, state) => const TodayScreen(),
          ),
          GoRoute(
            path: '/history',
            builder: (context, state) => const HistoryScreen(),
          ),
          GoRoute(
            path: '/analytics',
            builder: (context, state) => const AnalyticsScreen(),
          ),
          GoRoute(
            path: '/habits',
            builder: (context, state) => const HabitsScreen(),
          ),
          GoRoute(
            path: '/targets',
            builder: (context, state) => const TargetsScreen(),
          ),
          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfileScreen(),
          ),
        ],
      ),
    ],
  );
});
