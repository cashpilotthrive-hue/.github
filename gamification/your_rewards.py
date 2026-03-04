class YourRewards:
    """Make wealth building fun"""

    achievements = {
        'first_million': {'badge': '🥉', 'status': 'earned'},
        'first_billion': {'badge': '🥈', 'status': 'earned'},
        'first_trillion': {'badge': '🥇', 'status': 'earned'},
        'daily_target': {'badge': '⭐', 'status': '45x consecutive'},
        'perfect_week': {'badge': '🌟', 'status': '12 weeks'},
        'risk_master': {'badge': '🛡️', 'status': 'no drawdown >2%'},
    }

    def get_next_milestone(self):
        """What's your next achievement?"""
        return {
            'name': 'Billionaire Club',
            'progress': '87%',
            'next_level': 'Trillionaire Elite',
            'reward': '🎖️ Platinum Badge + Private Jet'
        }
