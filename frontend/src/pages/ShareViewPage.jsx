import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function ShareViewPage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/share/view/' + token)
      .then(res => setData(res.data))
      .catch(err => setError('Link is invalid or has expired.'));
  }, [token]);

  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 text-xl font-bold">{error}</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{data.documentName}</h1>
          <p className="text-gray-500">Shared via DocVoice Summary</p>
        </div>
        
        <div className="grid gap-8">
          {data.summaries.map(s => (
            <div key={s.pageNumber} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-[#0d9488] mb-4 border-b pb-2">Page {s.pageNumber}</h3>
              <div className="prose max-w-none text-gray-700">
                {s.summaryText || 'No summary available.'}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center text-gray-400 font-medium">
          Powered by DocVoice
        </div>
      </div>
    </div>
  );
}
