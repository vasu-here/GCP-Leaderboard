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
  const [activeSection, setActiveSection] = useState<any>(null);
  type section = {
    id : string,
    title : string,
    icon : string,
    color : string,
    content? : string[],
    isDosDonts? : boolean,
    isTable? : boolean
  }
  const sections :section[] = [
    {
      id: 'overview',
      title: 'Program Overview',
      icon: '🎓',
      color: 'blue',
      content: [
        'Build a strong foundation in Google Cloud',
        'Access exclusive courses on Google Skill Boost',
        'Gain in-demand skills: Cloud Computing & Generative AI',
        'Broaden knowledge & prepare for industry opportunities'
      ]
    },
    {
      id: 'checklist',
      title: 'Pre-Start Checklist',
      icon: '✅',
      color: 'green',
      content: [
        'Open an incognito browser window',
        'Use the official redemption link only',
        'Enter your unique access code',
        'Confirm that 9 initial credits appear',
        'Complete the first lab (minimum 6 minutes)',
        'Verify that 400 bonus credits have been added',
        'Begin the campaign syllabus using the official document'
      ]
    },
    {
      id: 'guidelines',
      title: 'Guidelines',
      icon: '📋',
      color: 'yellow',
      isDosDonts: true
    },
    {
      id: 'deadlines',
      title: 'Important Dates',
      icon: '⏰',
      color: 'red',
      isTable: true
    }
  ];

  return (
    <div className="fade-in max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl mb-8 google-shadow">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-red-500 via-yellow-500 to-green-500 opacity-90"></div>
        <div className="relative px-8 py-12 text-white">
          <h2 className="text-4xl font-light mb-3 animate-fade-in">
            Cloud Study Jams 2025
          </h2>
          <p className="text-xl font-light opacity-90">
            Access and Participation Guide
          </p>
        </div>
      </div>

      {/* Video Guide Alert */}
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-6 rounded-r-xl google-shadow animate-slide-in">
        <div className="flex items-start gap-4">
          <span className="text-3xl">🎥</span>
          <div>
            <h3 className="font-medium text-lg text-gray-800 mb-2">
              Before You Begin
            </h3>
            <p className="text-gray-700">
              Please watch the step-by-step YouTube guide before starting. This video demonstrates the complete process, including credit redemption, first lab completion, and common issues to avoid.
            </p>
            <a href="https://www.youtube.com/watch?v=WVdUW1wJwyI" className='text-red-500 font-bold'>→ Video Link</a>
          </div>
        </div>
      </div>

      {/* Main Sections Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {sections.map((section : section , index) => {
          // Define gradient colors for each section
          const gradientClasses = {
            blue: 'bg-gradient-to-r from-blue-400 to-blue-500',
            green: 'bg-gradient-to-r from-green-400 to-green-500',
            yellow: 'bg-gradient-to-r from-yellow-400 to-yellow-500',
            red: 'bg-gradient-to-r from-red-400 to-red-500'
          };

          return (
            <div
              key={section.id}
              className="bg-white rounded-xl google-shadow hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
            >
              <div className={`${gradientClasses[section.color as keyof typeof gradientClasses]} px-6 py-4 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{section.icon}</span>
                  <h3 className="text-xl font-medium text-white">{section.title}</h3>
                </div>
                <span
                  className="text-white text-2xl transform transition-transform duration-300"
                  style={{ transform: activeSection === section.id ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  ▼
                </span>
              </div>

              <div className={`transition-all duration-300 overflow-hidden ${activeSection === section.id ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-6">
                  {section.isDosDonts ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                        <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                          <span className="text-xl">✓</span> Do's
                        </h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex gap-2">
                            <span className="text-green-600 font-bold">•</span>
                            <span>Watch YouTube tutorials before attempting labs</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-green-600 font-bold">•</span>
                            <span>Keep each lab open for at least 6-7 minutes</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-green-600 font-bold">•</span>
                            <span>Focus on understanding the process</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-green-600 font-bold">•</span>
                            <span>Complete 100/100 checkpoints</span>
                          </li>
                        </ul>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200">
                        <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                          <span className="text-xl">✗</span> Don'ts
                        </h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex gap-2">
                            <span className="text-red-600 font-bold">•</span>
                            <span>Don't redeem code on different Google account</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-red-600 font-bold">•</span>
                            <span>Don't close labs early (forfeits points)</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-red-600 font-bold">•</span>
                            <span>Don't use credits for non-syllabus labs</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  ) : section.isTable ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-gray-700 font-semibold">Event</th>
                            <th className="px-4 py-3 text-left text-gray-700 font-semibold">Date/Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-gray-700">Campaign Deadline</td>
                            <td className="px-4 py-3 font-medium text-red-600">19 November, 5:00 PM IST</td>
                          </tr>
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-gray-700">Access Validity</td>
                            <td className="px-4 py-3 font-medium text-gray-800">1 month (non-extendable)</td>
                          </tr>
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-gray-700">Daily Lab Limit</td>
                            <td className="px-4 py-3 font-medium text-gray-800">15 labs per day</td>
                          </tr>
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-gray-700">Gen AI Arcade Start</td>
                            <td className="px-4 py-3 font-medium text-blue-600">4 November onwards</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {section.content!.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-gray-700 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                          <span className={`${section.color === 'blue' ? 'text-blue-500' : section.color === 'green' ? 'text-green-500' : section.color === 'yellow' ? 'text-yellow-500' : 'text-red-500'} mt-1 font-bold`}>•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Credit Redemption Steps */}
      <div className="bg-white rounded-xl google-shadow p-8 mb-8">
        <h3 className="text-2xl font-normal text-gray-800 mb-6 flex items-center gap-3">
          <span className="text-3xl">🎟️</span>
          Redeeming Credits – Step-by-Step
        </h3>

        <div className="grid md:grid-cols-5 gap-4">
          {[
            { step: '1', title: 'Incognito Mode', desc: 'Ctrl+Shift+N', color: 'blue' },
            { step: '2', title: 'Visit Link', desc: 'Check email', color: 'red' },
            { step: '3', title: 'Enter Code', desc: 'Single-use only', color: 'yellow' },
            { step: '4', title: 'Confirm Credits', desc: '9 initial credits', color: 'green' },
            { step: '5', title: 'First Lab', desc: '400 bonus credits', color: 'blue' }
          ].map((item, i) => (
            <div key={i} className="relative">
              <div className={`bg-gradient-to-br from-${item.color}-100 to-${item.color}-200 rounded-lg p-4 text-center hover:shadow-md transition-all duration-300 transform hover:-translate-y-1`}>
                <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-${item.color}-400 to-${item.color}-600 flex items-center justify-center text-black font-bold text-lg google-shadow`}>
                  {item.step}
                </div>
                <h4 className="font-semibold text-gray-800 mb-1 text-sm">{item.title}</h4>
                <p className="text-xs text-gray-600">{item.desc}</p>
              </div>
              {i < 4 && (
                <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 text-gray-400 text-2xl">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Support Section */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 google-shadow">
          <h3 className="font-semibold text-lg text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-2xl">🎮</span>
            Gen AI Arcade Game
          </h3>
          <p className="text-gray-700 text-sm mb-3">
            Join the Gen AI Arcade Game starting 4 November. Access code will be provided by organizers.
          </p>
          <div className="bg-white rounded-lg p-3 text-xs text-gray-600">
            <strong>Note:</strong> If no slots available, check back later. New slots open daily.
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 google-shadow">
          <h3 className="font-semibold text-lg text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-2xl">🆘</span>
            Troubleshooting
          </h3>
          <p className="text-gray-700 text-sm mb-3">
            If credits don't appear after first lab:
          </p>
          <ol className="space-y-2 text-sm text-gray-700">
            <li className="flex gap-2">
              <span className="font-bold text-orange-600">1.</span>
              <span>Wait 20-30 minutes and refresh</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-orange-600">2.</span>
              <span>Contact organizer or email: <strong>gdgocsupport@google.com</strong></span>
            </li>
          </ol>
        </div>
      </div>

      {/* Rewards & Recognition Section */}
      <div className="bg-linear-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 google-shadow mb-8">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-4xl">🏆</span>
          <h2 className="text-3xl font-normal text-gray-800">Rewards & Recognition</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Tier 1 */}
          <div className="bg-white rounded-2xl overflow-hidden google-shadow hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-center">
              <h3 className="text-2xl font-semibold text-white">Tier 1</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-blue-500 font-bold text-lg mt-1">1.</span>
                <p className="text-gray-700">
                  Gets <strong className="text-blue-600">100 participant swags</strong>.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-500 font-bold text-lg mt-1">2.</span>
                <p className="text-gray-700">
                  Access to premium live hands-on learning on <strong className="text-blue-600">Google Cloud Console</strong>.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-500 font-bold text-lg mt-1">3.</span>
                <p className="text-gray-700">
                  Earn official <strong className="text-blue-600">Google Cloud Skill Badges and Certifications</strong>.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-500 font-bold text-lg mt-1">4.</span>
                <p className="text-gray-700">
                  Get free <strong className="text-blue-600">Google Cloud Credits</strong> for premium labs.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-500 font-bold text-lg mt-1">5.</span>
                <p className="text-gray-700">
                  Top performers get a chance to <strong className="text-blue-600">join GDGoC NITP</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Tier 2 */}
          <div className="bg-white rounded-2xl overflow-hidden google-shadow hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-center">
              <h3 className="text-2xl font-semibold text-white">Tier 2</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-blue-500 font-bold text-lg mt-1">1.</span>
                <p className="text-gray-700">
                  Gets <strong className="text-blue-600">70 participant swags</strong>.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-500 font-bold text-lg mt-1">2.</span>
                <p className="text-gray-700">
                  Access to premium live hands-on learning on <strong className="text-blue-600">Google Cloud Console</strong>.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-500 font-bold text-lg mt-1">3.</span>
                <p className="text-gray-700">
                  Earn official <strong className="text-blue-600">Google Cloud Skill Badges and Certifications</strong>.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-500 font-bold text-lg mt-1">4.</span>
                <p className="text-gray-700">
                  Get free <strong className="text-blue-600">Google Cloud Credits</strong> for premium labs.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-500 font-bold text-lg mt-1">5.</span>
                <p className="text-gray-700">
                  Top performers get a chance to <strong className="text-blue-600">join GDGoC NITP</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Tier 3 */}
          <div className="bg-white rounded-2xl overflow-hidden google-shadow hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-center">
              <h3 className="text-2xl font-semibold text-white">Tier 3</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-blue-500 font-bold text-lg mt-1">1.</span>
                <p className="text-gray-700">
                  Gets <strong className="text-blue-600">50 participant swags</strong>.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-500 font-bold text-lg mt-1">2.</span>
                <p className="text-gray-700">
                  Access to premium live hands-on learning on <strong className="text-blue-600">Google Cloud Console</strong>.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-500 font-bold text-lg mt-1">3.</span>
                <p className="text-gray-700">
                  Earn official <strong className="text-blue-600">Google Cloud Skill Badges and Certifications</strong>.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-500 font-bold text-lg mt-1">4.</span>
                <p className="text-gray-700">
                  Get free <strong className="text-blue-600">Google Cloud Credits</strong> for premium labs.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-500 font-bold text-lg mt-1">5.</span>
                <p className="text-gray-700">
                  Top performers get a chance to <strong className="text-blue-600">join GDGoC NITP</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Final Note */}
      <div className="bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl p-8 text-white text-center google-shadow">
        <h3 className="text-2xl font-light mb-3">🚀 You're Ready to Begin!</h3>
        <p className="text-lg opacity-90 mb-4">
          Focus on understanding concepts, progress consistently, and reach out if you need help.
        </p>
        <p className="text-sm opacity-75">
          💡 Bookmark this guide and refer to it before starting any new lab
        </p>
      </div>
    </div>
  );
}