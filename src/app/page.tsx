'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ParticipantData {
  'User Name': string;
  'User Email': string;
  'Google Cloud Skills Boost Profile URL': string;
  'All Skill Badges & Games Completed': string;
  '# of Skill Badges Completed': string;
  'Names of Completed Skill Badges': string;
  '# of Arcade Games Completed': string;
  'Names of Completed Arcade Games': string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'rules'>('leaderboard');
  const [leaderboardData, setLeaderboardData] = useState<ParticipantData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async (): Promise<void> => {
    try {
      setLoading(true);
      // Changed from /leaderboard.csv to /api/leaderboard
      const response = await fetch('/api/leaderboard', {
        cache: 'no-store', // Always fetch fresh data
      });

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard data');
      }

      const text = await response.text();
      const parsed = parseCSV(text);
      setLeaderboardData(parsed);
    } catch (error) {
      console.error('Error loading CSV:', error);
      // Optionally show error to user
      alert('Failed to load leaderboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const parseCSV = (text: string): ParticipantData[] => {
    const lines = text.trim().split(/\r?\n/);
    const headers = lines[0]
      .split(',')
      .map((h) => h.replace(/^"|"$/g, '').trim());

    const data = lines.slice(1).map((line) => {
      const values: any = [];
      let inQuotes = false;
      let value = '';

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(value.trim().replace(/^"|"$/g, ''));
          value = '';
        } else {
          value += char;
        }
      }
      values.push(value.trim().replace(/^"|"$/g, ''));

      const obj: any = {};
      headers.forEach((header, i) => {
        obj[header] = values[i] || '';
      });
      return obj as ParticipantData;
    });

    return data;
  };

  const safeParseInt = (val: string): number => {
    const num = parseInt(val);
    return isNaN(num) ? 0 : num;
  };

  const sortedData = [...leaderboardData].sort((a, b) => {
    const scoreA =
      safeParseInt(a['# of Skill Badges Completed']) +
      safeParseInt(a['# of Arcade Games Completed']);
    const scoreB =
      safeParseInt(b['# of Skill Badges Completed']) +
      safeParseInt(b['# of Arcade Games Completed']);
    return scoreB - scoreA;
  });

  return (
    <div className="min-h-screen bg-white">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Roboto:wght@300;400;500;700&display=swap');
        
        * {
          font-family: 'Google Sans', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .google-shadow {
          box-shadow: 0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15);
        }

        .google-shadow-lg {
          box-shadow: 0 1px 3px 0 rgba(60, 64, 67, 0.3), 0 4px 8px 3px rgba(60, 64, 67, 0.15);
        }

        .google-btn {
          font-weight: 500;
          letter-spacing: 0.25px;
          text-transform: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .google-btn:hover {
          box-shadow: 0 1px 3px 0 rgba(60, 64, 67, 0.3), 0 4px 8px 3px rgba(60, 64, 67, 0.15);
        }

        .google-blue { color: #4285f4; }
        .google-red { color: #ea4335; }
        .google-yellow { color: #fbbc04; }
        .google-green { color: #34a853; }

        .google-bg-blue { background-color: #4285f4; }
        .google-bg-red { background-color: #ea4335; }
        .google-bg-yellow { background-color: #fbbc04; }
        .google-bg-green { background-color: #34a853; }

        .table-hover-row:hover {
          background-color: #f8f9fa;
        }

        .rank-medal {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          font-weight: 700;
          font-size: 16px;
        }

        .rank-1 {
          background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
          color: #b8860b;
          box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
        }

        .rank-2 {
          background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
          color: #696969;
          box-shadow: 0 2px 8px rgba(192, 192, 192, 0.4);
        }

        .rank-3 {
          background: linear-gradient(135deg, #cd7f32 0%, #e6a957 100%);
          color: #8b4513;
          box-shadow: 0 2px 8px rgba(205, 127, 50, 0.4);
        }

        .loading-spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #4285f4;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .fade-in {
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header with Google Cloud Colors */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-6 max-w-7xl">
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-8 google-bg-blue rounded"></div>
              <div className="w-3 h-8 google-bg-red rounded"></div>
              <div className="w-3 h-8 google-bg-yellow rounded"></div>
              <div className="w-3 h-8 google-bg-green rounded"></div>
            </div>
            <h1 className="text-3xl font-normal text-gray-800">
              Google Cloud Skills Boost
            </h1>
          </div>
          <h2 className="text-xl font-normal text-gray-600 ml-16">
            NIT Patna Leaderboard
          </h2>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/admin"
            className="google-btn inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-lg google-shadow hover:google-shadow-lg border border-gray-200"
          >
            <span className="text-xl">🔐</span>
            <span>Admin Panel</span>
          </Link>
          <button
            onClick={fetchLeaderboardData}
            className="google-btn inline-flex items-center gap-2 px-6 py-3 google-bg-blue text-white rounded-lg google-shadow hover:google-shadow-lg"
          >
            <span className="text-xl">🔄</span>
            <span>Refresh Data</span>
          </button>
        </div>

        {/* Tab Navigation - Google Material Style */}
        <div className="bg-white rounded-lg google-shadow mb-8 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all relative ${activeTab === 'leaderboard'
                  ? 'google-blue'
                  : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">🏆</span>
                <span>Leaderboard</span>
              </div>
              {activeTab === 'leaderboard' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 google-bg-blue"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all relative ${activeTab === 'rules'
                  ? 'google-blue'
                  : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">📋</span>
                <span>Rules</span>
              </div>
              {activeTab === 'rules' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 google-bg-blue"></div>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg google-shadow-lg p-8 fade-in">
          {activeTab === 'leaderboard' ? (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-normal text-gray-800">Rankings</h2>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full">
                  <span className="text-sm font-medium text-gray-600">Total Participants:</span>
                  <span className="text-sm font-bold google-blue">{leaderboardData.length}</span>
                  <span className="text-xs text-gray-500">(Top 100 shown)</span>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-20">
                  <div className="loading-spinner mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">Loading leaderboard...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Sr. No.
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Participant
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Email
                        </th>
                        {/* <th className="px-6 py-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Completed
                        </th> */}
                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Skill Badges
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Arcade Games
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Total Score
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedData.map((participant, index) => {
                        if (index >= 100) return null;
                        const skillBadges = safeParseInt(participant['# of Skill Badges Completed']);
                        const arcadeGames = safeParseInt(participant['# of Arcade Games Completed']);
                        const totalScore = skillBadges + arcadeGames;
                        const allCompleted = participant['All Skill Badges & Games Completed'] || 'No';
                        const profileUrl = participant['Google Cloud Skills Boost Profile URL']?.trim();

                        return (
                          <tr key={index} className="table-hover-row transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="font-medium text-gray-700 text-lg">
                                  #{index + 1}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {profileUrl ? (
                                <a
                                  href={profileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="google-blue hover:underline font-medium"
                                >
                                  {participant['User Name'] || 'N/A'}
                                </a>
                              ) : (
                                <span className="font-medium text-gray-800">
                                  {participant['User Name'] || 'N/A'}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {(participant['User Email'] || 'N/A').replace(/^"|"$/g, '')}
                            </td>
                            {/* <td className="px-6 py-4 whitespace-nowrap text-center">
                              {allCompleted.toLowerCase() === 'yes' ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium google-bg-green text-white">
                                  ✓ Yes
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                                  No
                                </span>
                              )}
                            </td> */}
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="google-blue font-bold text-lg">{skillBadges}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="google-red font-bold text-lg">{arcadeGames}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="inline-flex items-center px-4 py-2 rounded-full text-base font-bold google-bg-blue text-white google-shadow">
                                {totalScore}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <RulesSection />
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Last Updated: <span className="font-medium">{new Date().toLocaleDateString()}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function RulesSection() {
  return (
    <div className="fade-in">
      <h2 className="text-2xl font-normal text-gray-800 mb-8">Competition Rules</h2>
      <div className="space-y-6">
        <div className="border-l-4 border-blue-500 bg-blue-50 p-6 rounded-r-lg google-shadow">
          <h3 className="font-medium text-lg text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <span>Objective</span>
          </h3>
          <p className="text-gray-700 leading-relaxed">
            Complete as many Google Cloud skill badges and arcade games as possible to climb the leaderboard.
          </p>
        </div>

        <div className="border-l-4 border-green-500 bg-green-50 p-6 rounded-r-lg google-shadow">
          <h3 className="font-medium text-lg text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <span>Scoring System</span>
          </h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="google-blue mt-1">●</span>
              <span>Each completed <strong>Skill Badge</strong> = 1 point</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="google-red mt-1">●</span>
              <span>Each completed <strong>Arcade Game</strong> = 1 point</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="google-green mt-1">●</span>
              <span><strong>Total Score</strong> = Skill Badges + Arcade Games</span>
            </li>
          </ul>
        </div>

        <div className="border-l-4 border-yellow-500 bg-yellow-50 p-6 rounded-r-lg google-shadow">
          <h3 className="font-medium text-lg text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-2xl">🏅</span>
            <span>Rewards and Surprises</span>
          </h3>
          <p className="text-gray-700 leading-relaxed">
            To be revealed soon!
          </p>
        </div>
      </div>
    </div>
  );
}