import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PreviewIcon from '@mui/icons-material/Preview';
import AddIcon from '@mui/icons-material/Add';
import LockIcon from '@mui/icons-material/Lock';

const API_ENDPOINT = '/api/rules';

// Component for managing database query rules
const DatabaseRulesManager = () => {
  // State variables
  const [rules, setRules] = useState([]);
  const [filteredRules, setFilteredRules] = useState([]);
  const [databases, setDatabases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [translations, setTranslations] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [userHasAccess, setUserHasAccess] = useState(false);
  
  // Modal states
  const [openRuleEditor, setOpenRuleEditor] = useState(false);
  const [openRuleTester, setOpenRuleTester] = useState(false);
  const [currentRule, setCurrentRule] = useState(null);
  const [testQuery, setTestQuery] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState(null);
  
  // Query types available for rules
  const queryTypes = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'JOIN'];
  
  // Condition types available for rules
  const conditionTypes = [
    { id: 'enforce_where', label: 'Enforce WHERE Clause' },
    { id: 'restrict_columns', label: 'Restrict Columns' },
    { id: 'row_limit', label: 'Row Limit' },
    { id: 'time_window', label: 'Time Window Restriction' }
  ];
  
  // Masking policy types
  const maskingTypes = [
    { id: 'none', label: 'No Masking' },
    { id: 'partial', label: 'Partial (Last 4 digits)' },
    { id: 'full', label: 'Full (Complete masking)' },
    { id: 'hash', label: 'Hash Value' },
    { id: 'custom', label: 'Custom Pattern' }
  ];

  // Check user access and fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Skip access check and directly set access to true
        setUserHasAccess(true);
        
        // Fetch available databases
        const dbResponse = await fetch('http://localhost:3000/api/database/list');
        const dbData = await dbResponse.json();
        setDatabases(dbData);
        
        // Fetch rules
        const rulesResponse = await fetch(API_ENDPOINT);
        
        if (!rulesResponse.ok) {
          throw new Error(`Error ${rulesResponse.status}: ${rulesResponse.statusText}`);
        }
        
        const contentType = rulesResponse.headers.get("content-type");
        
        if (!contentType || !contentType.includes("application/json")) {
          const textResponse = await rulesResponse.text();
          console.error("Non-JSON response received:", textResponse.substring(0, 100) + "...");
          throw new Error("Expected JSON response but got: " + contentType);
        }
        
        const rulesData = await rulesResponse.json();
        setRules(rulesData);
        setFilteredRules(rulesData);
        
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = (event) => {
      const newTheme = event.detail?.theme || 
                      (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
      setDarkMode(newTheme === 'dark');
    };
    
    const isDarkMode = document.documentElement.classList.contains('dark') || 
                      window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDarkMode);
    
    window.addEventListener('themeChange', handleThemeChange);
    
    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);

  // Listen for language changes - FIXED
  useEffect(() => {
    const handleLanguageChange = (event) => {
      if (event.detail && event.detail.translations) {
        console.log("Language change detected:", event.detail);
        setTranslations(prevTranslations => ({
          ...prevTranslations, 
          ...event.detail.translations
        }));
      }
    };
    
    window.addEventListener('languageChange', handleLanguageChange);
    
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange);
    };
  }, []);
  
  // Set up page translation keys
  useEffect(() => {
    // Register this page's translation keys
    window.currentPageTranslationKeys = [
      'pageTitle', 'createRule', 'editRule', 'deleteRule', 'testRule',
      'database', 'queryTypes', 'conditions', 'maskingPolicy',
      'ruleName', 'ruleDescription', 'save', 'cancel', 'noRulesFound',
      'confirmDelete', 'testSQL', 'runTest', 'testResults',
      'searchPlaceholder', 'accessDenied', 'loading'
    ];
    
    // Set default English texts
    window.currentPageDefaultTexts = {
      pageTitle: 'Database Query Rules Manager',
      createRule: 'Create New Rule',
      editRule: 'Edit Rule',
      deleteRule: 'Delete Rule',
      testRule: 'Test Rule',
      database: 'Database',
      queryTypes: 'Query Types',
      conditions: 'Conditions',
      maskingPolicy: 'Masking Policy',
      ruleName: 'Rule Name',
      ruleDescription: 'Rule Description',
      save: 'Save',
      cancel: 'Cancel',
      noRulesFound: 'No rules found',
      confirmDelete: 'Are you sure you want to delete this rule?',
      testSQL: 'Test SQL Query',
      runTest: 'Run Test',
      testResults: 'Test Results',
      searchPlaceholder: 'Search rules...',
      accessDenied: 'Access Denied: You need database write permissions to access this page.',
      loading: 'Loading...'
    };
    
    // Initialize translations with default texts
    setTranslations(window.currentPageDefaultTexts);
    
    // If there's a stored language, trigger a translation
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage && storedLanguage !== 'english') {
      // Inform navbar that we need translations
      window.dispatchEvent(new CustomEvent('pageLoaded', { 
        detail: { needsTranslation: true, language: storedLanguage } 
      }));
    }

    return () => {
      delete window.currentPageTranslationKeys;
      delete window.currentPageDefaultTexts;
    };
  }, []);

  // Filter rules based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = rules.filter(rule => 
        rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.database.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRules(filtered);
    } else {
      setFilteredRules(rules);
    }
  }, [searchTerm, rules]);
  
  // Handlers
  const handleOpenRuleEditor = (rule = null) => {
    setCurrentRule(rule || {
      id: null,
      name: '',
      description: '',
      database: databases.length > 0 ? databases[0].name : '',
      queryTypes: [],
      conditions: [],
      maskingPolicies: []
    });
    setOpenRuleEditor(true);
  };
  
  const handleCloseRuleEditor = () => {
    setOpenRuleEditor(false);
    setCurrentRule(null);
  };
  
  const handleOpenRuleTester = (rule) => {
    setCurrentRule(rule);
    setTestQuery('SELECT * FROM ' + rule.database + '.example_table');
    setTestResult(null);
    setOpenRuleTester(true);
  };
  
  const handleCloseRuleTester = () => {
    setOpenRuleTester(false);
    setTestQuery('');
    setTestResult(null);
  };
  
  const handleOpenDeleteConfirm = (rule) => {
    setRuleToDelete(rule);
    setConfirmDeleteOpen(true);
  };
  
  const handleCloseDeleteConfirm = () => {
    setConfirmDeleteOpen(false);
    setRuleToDelete(null);
  };
  
  const handleSaveRule = async () => {
    // Validate form
    if (!currentRule.name || !currentRule.database || currentRule.queryTypes.length === 0) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      
      const method = currentRule.id ? 'PUT' : 'POST';
      const url = currentRule.id ? `${API_ENDPOINT}/${currentRule.id}` : API_ENDPOINT;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(currentRule)
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const savedRule = await response.json();
      
      // Update rules list
      setRules(prev => {
        if (currentRule.id) {
          return prev.map(r => r.id === savedRule.id ? savedRule : r);
        } else {
          return [...prev, savedRule];
        }
      });
      
      handleCloseRuleEditor();
      
    } catch (err) {
      console.error('Error saving rule:', err);
      setError('Failed to save rule');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteRule = async () => {
    if (!ruleToDelete) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(`${API_ENDPOINT}/${ruleToDelete.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      // Update rules list
      setRules(prev => prev.filter(r => r.id !== ruleToDelete.id));
      
      handleCloseDeleteConfirm();
      
    } catch (err) {
      console.error('Error deleting rule:', err);
      setError('Failed to delete rule');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRunTest = async () => {
    if (!testQuery || !currentRule) return;
    
    try {
      setLoading(true);
      
      const response = await fetch('/api/rules/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ruleId: currentRule.id,
          query: testQuery
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      setTestResult(result);
      
    } catch (err) {
      console.error('Error testing rule:', err);
      setTestResult({
        passed: false,
        error: err.message,
        modifiedQuery: null
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Get translated text - simplified
  const getTranslatedText = (key) => {
    return translations[key] || key;
  };
  
  // Render rule preview
  const renderRulePreview = () => {
    if (!currentRule) return null;
    
    return (
      <div className="p-4 border rounded-md mt-4">
        <h3 className="font-medium text-lg mb-2">Rule Preview</h3>
        <div className="grid grid-cols-1 gap-2">
          <div>
            <span className="font-medium">Database:</span> {currentRule.database}
          </div>
          <div>
            <span className="font-medium">Query Types:</span> {currentRule.queryTypes.join(', ')}
          </div>
          {currentRule.conditions && currentRule.conditions.length > 0 && (
            <div>
              <span className="font-medium">Conditions:</span>
              <ul className="list-disc list-inside ml-2">
                {currentRule.conditions.map((condition, idx) => (
                  <li key={idx}>
                    {conditionTypes.find(c => c.id === condition.type)?.label || condition.type}:
                    {" "}{condition.value}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {currentRule.maskingPolicies && currentRule.maskingPolicies.length > 0 && (
            <div>
              <span className="font-medium">Masking Policies:</span>
              <ul className="list-disc list-inside ml-2">
                {currentRule.maskingPolicies.map((policy, idx) => (
                  <li key={idx}>
                    Column {policy.column}: {maskingTypes.find(m => m.id === policy.type)?.label || policy.type}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Return access denied message if user doesn't have access
  if (!loading && !userHasAccess) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <LockIcon className="text-6xl text-red-500 mb-4" />
              <h1 className="text-2xl font-bold mb-2">{getTranslatedText('accessDenied')}</h1>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}
    style={{
        backgroundImage: `url('/choice-bg.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{getTranslatedText('pageTitle')}</h1>
          <button
            onClick={() => handleOpenRuleEditor()}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            <AddIcon className="mr-1" />
            {getTranslatedText('createRule')}
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <input
            type="text"
            placeholder={getTranslatedText('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
          />
        </div>
        
        {/* RulesList Component */}
        <div className={`overflow-x-auto rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
            <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  {getTranslatedText('ruleName')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  {getTranslatedText('database')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  {getTranslatedText('queryTypes')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  {getTranslatedText('conditions')}
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    {getTranslatedText('loading')}
                  </td>
                </tr>
              ) : filteredRules.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    {getTranslatedText('noRulesFound')}
                  </td>
                </tr>
              ) : (
                filteredRules.map((rule) => (
                  <tr key={rule.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{rule.name}</div>
                      <div className="text-sm opacity-70">{rule.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {rule.database}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {rule.queryTypes.map((type, idx) => (
                          <span key={idx} className={`px-2 py-1 text-xs rounded-full ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                            {type}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {rule.conditions && rule.conditions.length > 0 ? (
                        <span className="text-sm">
                          {rule.conditions.length} {rule.conditions.length === 1 ? 'condition' : 'conditions'}
                        </span>
                      ) : (
                        <span className="text-sm opacity-70">No conditions</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleOpenRuleTester(rule)}
                        className={`p-1 mr-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        title={getTranslatedText('testRule')}
                      >
                        <PreviewIcon className="text-green-500" />
                      </button>
                      <button
                        onClick={() => handleOpenRuleEditor(rule)}
                        className={`p-1 mr-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        title={getTranslatedText('editRule')}
                      >
                        <EditIcon className="text-blue-500" />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteConfirm(rule)}
                        className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        title={getTranslatedText('deleteRule')}
                      >
                        <DeleteIcon className="text-red-500" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* RuleEditor Modal */}
      <Dialog 
        open={openRuleEditor} 
        onClose={handleCloseRuleEditor}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentRule && currentRule.id ? getTranslatedText('editRule') : getTranslatedText('createRule')}
        </DialogTitle>
        <DialogContent>
          {currentRule && (
            <div className="grid grid-cols-1 gap-4 pt-2">
              <div>
                <label className="block text-sm font-medium mb-1">{getTranslatedText('ruleName')} *</label>
                <input
                  type="text"
                  value={currentRule.name || ''}
                  onChange={(e) => setCurrentRule({...currentRule, name: e.target.value})}
                  className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">{getTranslatedText('ruleDescription')}</label>
                <textarea
                  value={currentRule.description || ''}
                  onChange={(e) => setCurrentRule({...currentRule, description: e.target.value})}
                  rows="2"
                  className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">{getTranslatedText('database')} *</label>
                <select
                  value={currentRule.database || ''}
                  onChange={(e) => setCurrentRule({...currentRule, database: e.target.value})}
                  className={`w-full p-2 border rounded-md ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
                  required
                >
                  {databases.map((db) => (
                    <option key={db.id} value={db.name}>{db.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">{getTranslatedText('queryTypes')} *</label>
                <div className="flex flex-wrap gap-2">
                  {queryTypes.map((type) => (
                    <label key={type} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={currentRule.queryTypes?.includes(type) || false}
                        onChange={(e) => {
                          const updatedTypes = e.target.checked
                            ? [...(currentRule.queryTypes || []), type]
                            : (currentRule.queryTypes || []).filter(t => t !== type);
                          setCurrentRule({...currentRule, queryTypes: updatedTypes});
                        }}
                        className="mr-1"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">{getTranslatedText('conditions')}</label>
                <div className="space-y-2">
                  {(currentRule.conditions || []).map((condition, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 border rounded-md">
                      <div className="flex-grow">
                        <select
                          value={condition.type}
                          onChange={(e) => {
                            const updatedConditions = [...(currentRule.conditions || [])];
                            updatedConditions[idx] = {...condition, type: e.target.value};
                            setCurrentRule({...currentRule, conditions: updatedConditions});
                          }}
                          className={`w-full p-1 border rounded-md ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
                        >
                          {conditionTypes.map((type) => (
                            <option key={type.id} value={type.id}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-grow">
                        <input
                          type="text"
                          value={condition.value}
                          onChange={(e) => {
                            const updatedConditions = [...(currentRule.conditions || [])];
                            updatedConditions[idx] = {...condition, value: e.target.value};
                            setCurrentRule({...currentRule, conditions: updatedConditions});
                          }}
                          placeholder="Condition value"
                          className={`w-full p-1 border rounded-md ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                      <button
                        onClick={() => {
                          const updatedConditions = [...(currentRule.conditions || [])];
                          updatedConditions.splice(idx, 1);
                          setCurrentRule({...currentRule, conditions: updatedConditions});
                        }}
                        className="p-1 text-red-500"
                      >
                        <DeleteIcon fontSize="small" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newCondition = {
                        type: conditionTypes[0].id,
                        value: ''
                      };
                      setCurrentRule({
                        ...currentRule, 
                        conditions: [...(currentRule.conditions || []), newCondition]
                      });
                    }}
                    className={`w-full py-1 border-dashed border-2 rounded-md ${
                      darkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    + Add Condition
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">{getTranslatedText('maskingPolicy')}</label>
                <div className="space-y-2">
                  {(currentRule.maskingPolicies || []).map((policy, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 border rounded-md">
                      <div className="flex-grow">
                        <input
                          type="text"
                          value={policy.column}
                          onChange={(e) => {
                            const updatedPolicies = [...(currentRule.maskingPolicies || [])];
                            updatedPolicies[idx] = {...policy, column: e.target.value};
                            setCurrentRule({...currentRule, maskingPolicies: updatedPolicies});
                          }}
                          placeholder="Column name"
                          className={`w-full p-1 border rounded-md ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                      <div className="flex-grow">
                        <select
                          value={policy.type}
                          onChange={(e) => {
                            const updatedPolicies = [...(currentRule.maskingPolicies || [])];
                            updatedPolicies[idx] = {...policy, type: e.target.value};
                            setCurrentRule({...currentRule, maskingPolicies: updatedPolicies});
                          }}
                          className={`w-full p-1 border rounded-md ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
                        >
                          {maskingTypes.map((type) => (
                            <option key={type.id} value={type.id}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => {
                          const updatedPolicies = [...(currentRule.maskingPolicies || [])];
                          updatedPolicies.splice(idx, 1);
                          setCurrentRule({...currentRule, maskingPolicies: updatedPolicies});
                        }}
                        className="p-1 text-red-500"
                      >
                        <DeleteIcon fontSize="small" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newCondition = {
                        type: conditionTypes[0].id,
                        value: ''
                      };
                      setCurrentRule({
                        ...currentRule, 
                        conditions: [...(currentRule.conditions || []), newCondition]
                      });
                    }}
                    className={`w-full py-1 border-dashed border-2 rounded-md ${
                      darkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    + Add Condition
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">{getTranslatedText('maskingPolicy')}</label>
                <div className="space-y-2">
                  {(currentRule.maskingPolicies || []).map((policy, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 border rounded-md">
                      <div className="flex-grow">
                        <input
                          type="text"
                          value={policy.column}
                          onChange={(e) => {
                            const updatedPolicies = [...(currentRule.maskingPolicies || [])];
                            updatedPolicies[idx] = {...policy, column: e.target.value};
                            setCurrentRule({...currentRule, maskingPolicies: updatedPolicies});
                          }}
                          placeholder="Column name"
                          className={`w-full p-1 border rounded-md ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                      <div className="flex-grow">
                        <select
                          value={policy.type}
                          onChange={(e) => {
                            const updatedPolicies = [...(currentRule.maskingPolicies || [])];
                            updatedPolicies[idx] = {...policy, type: e.target.value};
                            setCurrentRule({...currentRule, maskingPolicies: updatedPolicies});
                          }}
                          className={`w-full p-1 border rounded-md ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
                        >
                          {maskingTypes.map((type) => (
                            <option key={type.id} value={type.id}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => {
                          const updatedPolicies = [...(currentRule.maskingPolicies || [])];
                          updatedPolicies.splice(idx, 1);
                          setCurrentRule({...currentRule, maskingPolicies: updatedPolicies});
                        }}
                        className="p-1 text-red-500"
                      >
                        <DeleteIcon fontSize="small" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newPolicy = {
                        column: '',
                        type: maskingTypes[0].id
                      };
                      setCurrentRule({
                        ...currentRule, 
                        maskingPolicies: [...(currentRule.maskingPolicies || []), newPolicy]
                      });
                    }}
                   className={`w-full py-1 border-dashed border-2 rounded-md ${
  darkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'
}`}
                  >
                    + Add Masking Policy
                  </button>
                </div>
              </div>
              
              {renderRulePreview()}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <button 
            onClick={handleCloseRuleEditor}
            className={`px-4 py-2 rounded-md ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            {getTranslatedText('cancel')}
          </button>
          <button 
            onClick={handleSaveRule}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {getTranslatedText('save')}
          </button>
        </DialogActions>
      </Dialog>
      
      {/* RuleTester Modal */}
      <Dialog 
        open={openRuleTester} 
        onClose={handleCloseRuleTester}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{getTranslatedText('testRule')}</DialogTitle>
        <DialogContent>
          {currentRule && (
            <div className="space-y-4 pt-2">
              <div>
                <h3 className="font-medium">{currentRule.name}</h3>
                <p className="text-sm opacity-70">{currentRule.description}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">{getTranslatedText('testSQL')}</label>
                <textarea
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  rows="4"
                  className={`w-full p-2 border rounded-md font-mono text-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
                ></textarea>
              </div>
              
              {testResult && (
                <div className={`p-4 rounded-md ${
                  testResult.passed ? 
                    (darkMode ? 'bg-green-900 text-green-100' : 'bg-green-100 text-green-800') : 
                    (darkMode ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-800')
                }`}>
                  <h3 className="font-medium mb-2">{getTranslatedText('testResults')}</h3>
                  
                  <div className={`mb-2 p-2 rounded ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <p className="font-medium">Status: {testResult.passed ? 'Passed' : 'Failed'}</p>
                    {testResult.error && <p>Error: {testResult.error}</p>}
                  </div>
                  
                  {testResult.modifiedQuery && (
                    <div className={`p-2 rounded font-mono text-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                      <p className="font-medium mb-1">Modified Query:</p>
                      <pre>{testResult.modifiedQuery}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <button 
            onClick={handleCloseRuleTester}
            className={`px-4 py-2 rounded-md ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            {getTranslatedText('cancel')}
          </button>
          <button 
            onClick={handleRunTest}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            {getTranslatedText('runTest')}
          </button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={handleCloseDeleteConfirm}
      >
        <DialogTitle>{getTranslatedText('deleteRule')}</DialogTitle>
        <DialogContent>
          <p>{getTranslatedText('confirmDelete')}</p>
          {ruleToDelete && (
            <div className="mt-2 font-medium">"{ruleToDelete.name}"</div>
          )}
        </DialogContent>
        <DialogActions>
          <button
            onClick={handleCloseDeleteConfirm}
            className={`px-4 py-2 rounded-md ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            {getTranslatedText('cancel')}
          </button>
          <button
            onClick={handleDeleteRule}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            {getTranslatedText('deleteRule')}
          </button>
        </DialogActions>
      </Dialog>
      <footer className="mt-auto py-4 text-center backdrop-blur-sm bg-white/30 dark:bg-black/30">
        <p className="text-sm">© 2025 Data Visualization Platform</p>
      </footer>
    </div>
  );
};

export default DatabaseRulesManager;