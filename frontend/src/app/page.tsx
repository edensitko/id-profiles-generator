"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [count, setCount] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [people, setPeople] = useState<any[]>([]);
  const [filteredPeople, setFilteredPeople] = useState<any[]>([]);
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'ascending' | 'descending'} | null>(null);
  const [filterText, setFilterText] = useState<string>("");
  const [activeTab, setActiveTab] = useState<'table' | 'cards' | 'compact'>('cards');
  const [BACKEND_URL,] = useState<string>("http://localhost:5010");
  const [options, setOptions] = useState({
    includeFirstName: true,
    includeLastName: true,
    includeEmail: true,
    includeId: true,
    includeGender: true,
    includeLandmarks: true,
    includeAge: true,
    includeCity: true,
  });

  useEffect(() => {
    let result = [...people];
    
    // Apply filtering
    if (filterText) {
      const lowerCaseFilter = filterText.toLowerCase();
      result = result.filter(person => {
        // Check if the person has the property before trying to filter on it
        const firstNameMatch = options.includeFirstName && person.first_name && 
          person.first_name.toLowerCase().includes(lowerCaseFilter);
        
        const lastNameMatch = options.includeLastName && person.last_name && 
          person.last_name.toLowerCase().includes(lowerCaseFilter);
        
        const fullNameMatch = person.full_name && 
          person.full_name.toLowerCase().includes(lowerCaseFilter);
        
        const emailMatch = options.includeEmail && person.email && 
          person.email.toLowerCase().includes(lowerCaseFilter);
        
        const idMatch = options.includeId && person.id && 
          person.id.toString().includes(lowerCaseFilter);
        
        // For gender, translate to Hebrew for filtering
        const genderInHebrew = person.gender === "male" ? "זכר" : person.gender === "female" ? "נקבה" : "";
        const genderMatch = options.includeGender && person.gender && 
          (person.gender.toLowerCase().includes(lowerCaseFilter) || 
           genderInHebrew.includes(lowerCaseFilter));
        
        return firstNameMatch || lastNameMatch || fullNameMatch || emailMatch || idMatch || genderMatch;
      });
    }
    
    // Apply sorting
    if (sortConfig !== null) {
      result.sort((a, b) => {
        if (a[sortConfig.key] === undefined || a[sortConfig.key] === null) return 1;
        if (b[sortConfig.key] === undefined || b[sortConfig.key] === null) return -1;
        
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Convert to lowercase for string comparison
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredPeople(result);
  }, [people, filterText, sortConfig, options]);

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setOptions(prev => ({ ...prev, [name]: checked }));
  };

  const generatePeople = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        count: count.toString(),
        includeFirstName: options.includeFirstName.toString(),
        includeLastName: options.includeLastName.toString(),
        includeEmail: options.includeEmail.toString(),
        includeId: options.includeId.toString(),
        includeGender: options.includeGender.toString(),
        includeAge: options.includeAge.toString(),
        includeCity: options.includeCity.toString(),
      });

      const response = await fetch(`${BACKEND_URL}/api/generate-israeli-person?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      
      const data = await response.json();
      setPeople(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Error generating profiles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = async () => {
    if (people.length === 0) {
      alert("אין נתונים להורדה. אנא צור פרופילים קודם.");
      return;
    }

    try {
      setDownloading(true);
      const response = await fetch(`${BACKEND_URL}/download-excel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ people: filteredPeople }),
      });

      if (!response.ok) {
        throw new Error("Failed to download Excel");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `israeli_profiles_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading Excel:", error);
      alert("שגיאה בהורדת הקובץ. אנא נסה שוב.");
    } finally {
      setDownloading(false);
    }
  };

  // Render table headers based on selected options
  const renderTableHeaders = () => {
    return (
      <tr>
        {options.includeId && (
          <th 
            className="cursor-pointer hover:bg-gray-100"
            onClick={() => requestSort('id')}
          >
            מספר זהות {getSortIndicator('id')}
          </th>
        )}
        {(options.includeFirstName || options.includeLastName) && (
          <th 
            className="cursor-pointer hover:bg-gray-100"
            onClick={() => requestSort('full_name')}
          >
            שם מלא {getSortIndicator('full_name')}
          </th>
        )}
        {options.includeEmail && (
          <th 
            className="cursor-pointer hover:bg-gray-100"
            onClick={() => requestSort('email')}
          >
            אימייל {getSortIndicator('email')}
          </th>
        )}
        {options.includeGender && (
          <th 
            className="cursor-pointer hover:bg-gray-100"
            onClick={() => requestSort('gender')}
          >
            מגדר {getSortIndicator('gender')}
          </th>
        )}
        {options.includeAge && (
          <th 
            className="cursor-pointer hover:bg-gray-100"
            onClick={() => requestSort('age')}
          >
            גיל {getSortIndicator('age')}
          </th>
        )}
        {options.includeCity && (
          <th 
            className="cursor-pointer hover:bg-gray-100"
            onClick={() => requestSort('city')}
          >
            עיר {getSortIndicator('city')}
          </th>
        )}
        <th className="w-24">פעולות</th>
      </tr>
    );
  };

  // Render table rows based on filtered people
  const renderTableRows = () => {
    return filteredPeople.map((person, index) => (
      <tr key={index} className="border-b hover:bg-gray-50">
        {options.includeId && (
          <td className="py-3 px-4">
            <div className="flex items-center">
              <span className={`font-mono ${person.id_valid === false ? 'text-red-500' : ''}`}>
                {person.id}
              </span>
              <button 
                className="ml-2 text-indigo-600 hover:text-indigo-800"
                onClick={() => navigator.clipboard.writeText(person.id)}
                title="העתק מספר זהות"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
          </td>
        )}
        {(options.includeFirstName || options.includeLastName) && (
          <td className="py-3 px-4">
            {person.full_name}
          </td>
        )}
        {options.includeEmail && (
          <td className="py-3 px-4">
            <div className="flex items-center">
              <span className={`font-mono ${person.email_valid === false ? 'text-red-500' : ''}`}>
                {person.email}
              </span>
              <button 
                className="ml-2 text-indigo-600 hover:text-indigo-800"
                onClick={() => navigator.clipboard.writeText(person.email)}
                title="העתק אימייל"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
          </td>
        )}
        {options.includeGender && (
          <td className="py-3 px-4">
            {person.gender === "male" ? "זכר" : "נקבה"}
          </td>
        )}
        {options.includeAge && (
          <td className="py-3 px-4">
            {person.age}
          </td>
        )}
        {options.includeCity && (
          <td className="py-3 px-4">
            {person.city}
          </td>
        )}
        <td className="py-3 px-4">
          <button 
            className="text-indigo-600 hover:text-indigo-800"
            onClick={() => {
              const text = `שם: ${person.full_name}\nאימייל: ${person.email}\nת.ז: ${person.id}${person.gender ? `\nמגדר: ${person.gender === 'male' ? 'זכר' : 'נקבה'}` : ''}${person.age ? `\nגיל: ${person.age}` : ''}${person.city ? `\nעיר: ${person.city}` : ''}`;
              navigator.clipboard.writeText(text);
              
              // Show toast
              const toast = document.getElementById('toast');
              if (toast) {
                toast.classList.add('opacity-100');
                setTimeout(() => {
                  toast.classList.remove('opacity-100');
                }, 2000);
              }
            }}
            title="העתק הכל"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </td>
      </tr>
    ));
  };

  // Render card view
  const renderCards = () => {
    return (
      <div className="grid grid-cols-3 gap-4">
        {filteredPeople.map((person, index) => (
          <div key={index} className="glass-card p-4">
            <div className="text-center mb-3">
              {(options.includeFirstName || options.includeLastName) && (
                <h3 className="text-xl font-bold truncate" title={person.full_name}>{person.full_name}</h3>
              )}
            </div>
            
            <div className="space-y-2">
              {options.includeEmail && (
                <div className="glass py-1 px-2 rounded-lg flex justify-between items-center">
                  <div className="overflow-hidden">
                    <span className="text-sm text-gray-500 block">אימייל</span>
                    <p className="font-mono text-base truncate" title={person.email}>{person.email}</p>
                  </div>
                  <button 
                    className="text-indigo-600 hover:text-indigo-800 flex-shrink-0 ml-2"
                    onClick={() => {
                      navigator.clipboard.writeText(person.email);
                      showCopyMessage("אימייל הועתק ללוח");
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </div>
              )}
              
              {options.includeId && (
                <div className="glass py-1 px-2 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="text-sm text-gray-500 block">תעודת זהות</span>
                    <p className="font-mono text-base">{person.id}</p>
                  </div>
                  <button 
                    className="text-indigo-600 hover:text-indigo-800 flex-shrink-0 ml-2"
                    onClick={() => {
                      navigator.clipboard.writeText(person.id);
                      showCopyMessage("מספר זהות הועתק ללוח");
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-2">
                {options.includeGender && (
                  <div className="glass py-1 px-2 rounded-lg cursor-pointer" 
                    onClick={() => {
                      navigator.clipboard.writeText(person.gender === "male" ? "זכר" : "נקבה");
                      showCopyMessage("מגדר הועתק ללוח");
                    }}
                  >
                    <span className="text-sm text-gray-500 block">מגדר</span>
                    <p className="text-base">{person.gender === "male" ? "זכר" : "נקבה"}</p>
                  </div>
                )}
                
                {options.includeAge && (
                  <div className="glass py-1 px-2 rounded-lg cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(person.age.toString());
                      showCopyMessage("גיל הועתק ללוח");
                    }}
                  >
                    <span className="text-sm text-gray-500 block">גיל</span>
                    <p className="text-base">{person.age}</p>
                  </div>
                )}
                
                {options.includeCity && (
                  <div className="glass py-1 px-2 rounded-lg cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(person.city);
                      showCopyMessage("עיר הועתקה ללוח");
                    }}
                  >
                    <span className="text-sm text-gray-500 block">עיר</span>
                    <p className="text-base truncate" title={person.city}>{person.city}</p>
                  </div>
                )}
              </div>
              
              <button 
                className="glass-button w-full py-1.5 mt-2 flex items-center justify-center text-base"
                onClick={() => {
                  const text = `שם: ${person.full_name}\nאימייל: ${person.email}\nת.ז: ${person.id}${person.gender ? `\nמגדר: ${person.gender === 'male' ? 'זכר' : 'נקבה'}` : ''}${person.age ? `\nגיל: ${person.age}` : ''}${person.city ? `\nעיר: ${person.city}` : ''}`;
                  navigator.clipboard.writeText(text);
                  showCopyMessage("כל הפרטים הועתקו ללוח");
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                העתק הכל
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render compact view
  const renderCompactView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        {filteredPeople.map((person, index) => (
          <div key={index} className="glass p-3 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                {(options.includeFirstName || options.includeLastName) && (
                  <h3 className="text-xl font-bold truncate" title={person.full_name}>{person.full_name}</h3>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {options.includeEmail && (
                  <div className="text-sm">
                    <span className="font-semibold">אימייל:</span> {person.email}
                    <button 
                      className="text-indigo-600 hover:text-indigo-800 mr-2"
                      onClick={() => navigator.clipboard.writeText(person.email)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                  </div>
                )}
                {options.includeId && (
                  <div className="text-sm">
                    <span className="font-semibold">ת.ז:</span> {person.id}
                    <button 
                      className="text-indigo-600 hover:text-indigo-800 mr-2"
                      onClick={() => navigator.clipboard.writeText(person.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                  </div>
                )}
                {options.includeGender && (
                  <div className="text-sm">
                    <span className="font-semibold">מגדר:</span> {person.gender === "male" ? "זכר" : "נקבה"}
                  </div>
                )}
                {options.includeAge && (
                  <div className="text-sm">
                    <span className="font-semibold">גיל:</span> {person.age}
                  </div>
                )}
                {options.includeCity && (
                  <div className="text-sm">
                    <span className="font-semibold">עיר:</span> {person.city}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <button 
                  className="glass-button text-sm py-1 px-3"
                  onClick={() => {
                    const text = `שם: ${person.full_name}\nאימייל: ${person.email}\nת.ז: ${person.id}${person.gender ? `\nמגדר: ${person.gender === 'male' ? 'זכר' : 'נקבה'}` : ''}${person.age ? `\nגיל: ${person.age}` : ''}${person.city ? `\nעיר: ${person.city}` : ''}`;
                    navigator.clipboard.writeText(text);
                    
                    // Show toast
                    const toast = document.getElementById('toast');
                    if (toast) {
                      toast.classList.add('opacity-100');
                      setTimeout(() => {
                        toast.classList.remove('opacity-100');
                      }, 2000);
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  העתק הכל
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Function to show copy message
  const showCopyMessage = (message: string) => {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    if (toast && toastMessage) {
      toastMessage.textContent = message;
      toast.classList.add('opacity-100');
      setTimeout(() => {
        toast.classList.remove('opacity-100');
      }, 2000);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto bg-white" dir="rtl">
      <div className="glass p-0 mb-8 overflow-hidden rounded-xl shadow-lg">
        <div className="bg-gradient-to-l from-indigo-600 to-blue-500 text-white p-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">יצירת משתמשים ישראליים</h1>
            <p className="text-xl opacity-90 mb-6">צור פרופילים ישראליים אקראיים עם נתונים אמיתיים בקלות ובמהירות</p>
            <div className="flex justify-center">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm inline-flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                מחולל מהיר ויעיל
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm mb-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                הגדרות
              </h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-gray-700">מספר פרופילים</label>
                <div className="flex">
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={count}
                    onChange={(e) => setCount(parseInt(e.target.value) || 10)}
                    className="glass-input w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-md font-medium mb-3 text-gray-700 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  שדות להכללה
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow transition-all">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="includeFirstName"
                        checked={options.includeFirstName}
                        onChange={handleCheckboxChange}
                        className="ml-2 w-4 h-4 accent-indigo-600"
                      />
                      <span>שם פרטי</span>
                    </label>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow transition-all">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="includeLastName"
                        checked={options.includeLastName}
                        onChange={handleCheckboxChange}
                        className="ml-2 w-4 h-4 accent-indigo-600"
                      />
                      <span>שם משפחה</span>
                    </label>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow transition-all">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="includeEmail"
                        checked={options.includeEmail}
                        onChange={handleCheckboxChange}
                        className="ml-2 w-4 h-4 accent-indigo-600"
                      />
                      <span>אימייל</span>
                    </label>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow transition-all">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="includeId"
                        checked={options.includeId}
                        onChange={handleCheckboxChange}
                        className="ml-2 w-4 h-4 accent-indigo-600"
                      />
                      <span>מספר זהות</span>
                    </label>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow transition-all">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="includeGender"
                        checked={options.includeGender}
                        onChange={handleCheckboxChange}
                        className="ml-2 w-4 h-4 accent-indigo-600"
                      />
                      <span>מגדר</span>
                    </label>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow transition-all">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="includeAge"
                        checked={options.includeAge}
                        onChange={handleCheckboxChange}
                        className="ml-2 w-4 h-4 accent-indigo-600"
                      />
                      <span>גיל</span>
                    </label>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow transition-all">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="includeCity"
                        checked={options.includeCity}
                        onChange={handleCheckboxChange}
                        className="ml-2 w-4 h-4 accent-indigo-600"
                      />
                      <span>עיר</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <button
                  onClick={generatePeople}
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    loading 
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                      : "bg-gradient-to-l from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white shadow-md hover:shadow-lg"
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      טוען...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      צור פרופילים
                    </>
                  )}
                </button>
                
                <button
                  onClick={downloadExcel}
                  disabled={people.length === 0 || downloading}
                  className={`w-full py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    people.length === 0 || downloading 
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                      : "bg-white border border-green-500 text-green-600 hover:bg-green-50 shadow-sm hover:shadow"
                  }`}
                >
                  {downloading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      מוריד...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      הורד כקובץ Excel
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {people.length > 0 && (
        <div className="glass p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">תוצאות ({filteredPeople.length} פרופילים)</h2>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="חיפוש..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="glass-input"
                />
              </div>
              
              <div className="flex rounded-lg overflow-hidden">
                <button
                  onClick={() => setActiveTab('table')}
                  className={`px-3 py-2 ${
                    activeTab === 'table' 
                      ? 'glass-button-primary' 
                      : 'glass-button'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                
                <button
                  onClick={() => setActiveTab('cards')}
                  className={`px-3 py-2 ${
                    activeTab === 'cards' 
                      ? 'glass-button-primary' 
                      : 'glass-button'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                
                <button
                  onClick={() => setActiveTab('compact')}
                  className={`px-3 py-2 ${
                    activeTab === 'compact' 
                      ? 'glass-button-primary' 
                      : 'glass-button'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {activeTab === 'table' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  {renderTableHeaders()}
                </thead>
                <tbody>
                  {renderTableRows()}
                </tbody>
              </table>
            </div>
          )}
          
          {activeTab === 'cards' && (
            <div className="grid grid-cols-3 gap-4">
              {filteredPeople.map((person, index) => (
                <div key={index} className="glass-card p-4">
                  <div className="text-center mb-3">
                    {(options.includeFirstName || options.includeLastName) && (
                      <h3 className="text-xl font-bold truncate" title={person.full_name}>{person.full_name}</h3>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {options.includeEmail && (
                      <div className="glass py-1 px-2 rounded-lg flex justify-between items-center">
                        <div className="overflow-hidden">
                          <span className="text-sm text-gray-500 block">אימייל</span>
                          <p className="font-mono text-base truncate" title={person.email}>{person.email}</p>
                        </div>
                        <button 
                          className="text-indigo-600 hover:text-indigo-800 flex-shrink-0 ml-2"
                          onClick={() => {
                            navigator.clipboard.writeText(person.email);
                            showCopyMessage("אימייל הועתק ללוח");
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                      </div>
                    )}
                    
                    {options.includeId && (
                      <div className="glass py-1 px-2 rounded-lg flex justify-between items-center">
                        <div>
                          <span className="text-sm text-gray-500 block">תעודת זהות</span>
                          <p className="font-mono text-base">{person.id}</p>
                        </div>
                        <button 
                          className="text-indigo-600 hover:text-indigo-800 flex-shrink-0 ml-2"
                          onClick={() => {
                            navigator.clipboard.writeText(person.id);
                            showCopyMessage("מספר זהות הועתק ללוח");
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-3 gap-2">
                      {options.includeGender && (
                        <div className="glass py-1 px-2 rounded-lg cursor-pointer" 
                          onClick={() => {
                            navigator.clipboard.writeText(person.gender === "male" ? "זכר" : "נקבה");
                            showCopyMessage("מגדר הועתק ללוח");
                          }}
                        >
                          <span className="text-sm text-gray-500 block">מגדר</span>
                          <p className="text-base">{person.gender === "male" ? "זכר" : "נקבה"}</p>
                        </div>
                      )}
                      
                      {options.includeAge && (
                        <div className="glass py-1 px-2 rounded-lg cursor-pointer"
                          onClick={() => {
                            navigator.clipboard.writeText(person.age.toString());
                            showCopyMessage("גיל הועתק ללוח");
                          }}
                        >
                          <span className="text-sm text-gray-500 block">גיל</span>
                          <p className="text-base">{person.age}</p>
                        </div>
                      )}
                      
                      {options.includeCity && (
                        <div className="glass py-1 px-2 rounded-lg cursor-pointer"
                          onClick={() => {
                            navigator.clipboard.writeText(person.city);
                            showCopyMessage("עיר הועתקה ללוח");
                          }}
                        >
                          <span className="text-sm text-gray-500 block">עיר</span>
                          <p className="text-base truncate" title={person.city}>{person.city}</p>
                        </div>
                      )}
                    </div>
                    
                    <button 
                      className="glass-button w-full py-1.5 mt-2 flex items-center justify-center text-base"
                      onClick={() => {
                        const text = `שם: ${person.full_name}\nאימייל: ${person.email}\nת.ז: ${person.id}${person.gender ? `\nמגדר: ${person.gender === 'male' ? 'זכר' : 'נקבה'}` : ''}${person.age ? `\nגיל: ${person.age}` : ''}${person.city ? `\nעיר: ${person.city}` : ''}`;
                        navigator.clipboard.writeText(text);
                        showCopyMessage("כל הפרטים הועתקו ללוח");
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      העתק הכל
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 'compact' && (
            <div className="space-y-3">
              {filteredPeople.map((person, index) => (
                <div key={index} className="glass p-3 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div>
                      {(options.includeFirstName || options.includeLastName) && (
                        <div className="font-bold">{person.full_name}</div>
                      )}
                      {options.includeEmail && (
                        <div className="font-mono text-sm flex items-center">
                          {person.email}
                          <button 
                            className="text-indigo-600 hover:text-indigo-800 mr-2"
                            onClick={() => navigator.clipboard.writeText(person.email)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {options.includeId && (
                        <div className="text-sm">
                          <span className="font-semibold">ת.ז:</span> {person.id}
                          <button 
                            className="text-indigo-600 hover:text-indigo-800 mr-2"
                            onClick={() => navigator.clipboard.writeText(person.id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </button>
                        </div>
                      )}
                      {options.includeGender && (
                        <div className="text-sm">
                          <span className="font-semibold">מגדר:</span> {person.gender === "male" ? "זכר" : "נקבה"}
                        </div>
                      )}
                      {options.includeAge && (
                        <div className="text-sm">
                          <span className="font-semibold">גיל:</span> {person.age}
                        </div>
                      )}
                      {options.includeCity && (
                        <div className="text-sm">
                          <span className="font-semibold">עיר:</span> {person.city}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-end">
                      <button 
                        className="glass-button text-sm py-1 px-3"
                        onClick={() => {
                          const text = `שם: ${person.full_name}\nאימייל: ${person.email}\nת.ז: ${person.id}${person.gender ? `\nמגדר: ${person.gender === 'male' ? 'זכר' : 'נקבה'}` : ''}${person.age ? `\nגיל: ${person.age}` : ''}${person.city ? `\nעיר: ${person.city}` : ''}`;
                          navigator.clipboard.writeText(text);
                          
                          // Show toast
                          const toast = document.getElementById('toast');
                          if (toast) {
                            toast.classList.add('opacity-100');
                            setTimeout(() => {
                              toast.classList.remove('opacity-100');
                            }, 2000);
                          }
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        העתק הכל
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Toast notification for copy operations */}
      <div id="toast" className="fixed bottom-4 right-4 opacity-0 transition-opacity duration-300 glass p-3 text-indigo-600 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span id="toast-message">הועתק ללוח</span>
      </div>
    </main>
  );
}
