import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axiosClient';
import { useNavigate } from 'react-router';

const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.enum(['array', 'linkedList', 'graph', 'dp']),
  visibleTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
      explanation: z.string().min(1, 'Explanation is required')
    })
  ).min(1, 'At least one visible test case required'),
  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required')
    })
  ).min(1, 'At least one hidden test case required'),
  startCode: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      initialCode: z.string().min(1, 'Initial code is required')
    })
  ).length(3, 'All three languages required'),
  referenceSolution: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      completeCode: z.string().min(1, 'Complete code is required')
    })
  ).length(3, 'All three languages required')
});

function AdminPanel() {
  const navigate = useNavigate();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      startCode: [
        { language: 'C++', initialCode: '' },
        { language: 'Java', initialCode: '' },
        { language: 'JavaScript', initialCode: '' }
      ],
      referenceSolution: [
        { language: 'C++', completeCode: '' },
        { language: 'Java', completeCode: '' },
        { language: 'JavaScript', completeCode: '' }
      ]
    }
  });

  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible
  } = useFieldArray({
    control,
    name: 'visibleTestCases'
  });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden
  } = useFieldArray({
    control,
    name: 'hiddenTestCases'
  });

  const onSubmit = async (data) => {
    try {
      await axiosClient.post('/problem/create', data);
      alert('Problem created successfully!');
      navigate('/');
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Create New Problem</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="card bg-base-100 shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Basic Information</h2>
          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Title</span>
              </label>
              <input
                {...register('title')}
                className={`input input-bordered w-full ${errors.title ? 'input-error' : 'focus:ring-2 focus:ring-primary'}`}
                placeholder="Enter problem title"
              />
              {errors.title && (
                <span className="text-error text-sm mt-1">{errors.title.message}</span>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Description</span>
              </label>
              <textarea
                {...register('description')}
                className={`textarea textarea-bordered h-40 w-full ${errors.description ? 'textarea-error' : 'focus:ring-2 focus:ring-primary'}`}
                placeholder="Enter problem description (supports markdown)"
              />
              {errors.description && (
                <span className="text-error text-sm mt-1">{errors.description.message}</span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Difficulty</span>
                </label>
                <select
                  {...register('difficulty')}
                  className={`select select-bordered w-full ${errors.difficulty ? 'select-error' : 'focus:ring-2 focus:ring-primary'}`}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Tag</span>
                </label>
                <select
                  {...register('tags')}
                  className={`select select-bordered w-full ${errors.tags ? 'select-error' : 'focus:ring-2 focus:ring-primary'}`}
                >
                  <option value="array">Array</option>
                  <option value="linkedList">Linked List</option>
                  <option value="graph">Graph</option>
                  <option value="dp">Dynamic Programming</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Test Cases */}
        <div className="card bg-base-100 shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Test Cases</h2>
          
          {/* Visible Test Cases */}
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-lg">Visible Test Cases</h3>
              <button
                type="button"
                onClick={() => appendVisible({ input: '', output: '', explanation: '' })}
                className="btn btn-primary btn-sm gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Case
              </button>
            </div>
            
            {visibleFields.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No visible test cases added yet
              </div>
            )}
            
            <div className="space-y-4">
              {visibleFields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 bg-base-200/30">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">Test Case #{index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeVisible(index)}
                      className="btn btn-error btn-xs gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Input</span>
                      </label>
                      <textarea
                        {...register(`visibleTestCases.${index}.input`)}
                        placeholder="Input (JSON format recommended)"
                        className="textarea textarea-bordered w-full font-mono text-sm"
                        rows={3}
                      />
                    </div>
                    
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Output</span>
                      </label>
                      <textarea
                        {...register(`visibleTestCases.${index}.output`)}
                        placeholder="Expected output"
                        className="textarea textarea-bordered w-full font-mono text-sm"
                        rows={2}
                      />
                    </div>
                    
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Explanation</span>
                      </label>
                      <textarea
                        {...register(`visibleTestCases.${index}.explanation`)}
                        placeholder="Explanation for the test case"
                        className="textarea textarea-bordered w-full"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hidden Test Cases */}
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-lg">Hidden Test Cases</h3>
              <button
                type="button"
                onClick={() => appendHidden({ input: '', output: '' })}
                className="btn btn-primary btn-sm gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Case
              </button>
            </div>
            
            {hiddenFields.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No hidden test cases added yet
              </div>
            )}
            
            <div className="space-y-4">
              {hiddenFields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 bg-base-200/30">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">Hidden Test #{index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeHidden(index)}
                      className="btn btn-error btn-xs gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Input</span>
                      </label>
                      <textarea
                        {...register(`hiddenTestCases.${index}.input`)}
                        placeholder="Input (JSON format recommended)"
                        className="textarea textarea-bordered w-full font-mono text-sm"
                        rows={3}
                      />
                    </div>
                    
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Output</span>
                      </label>
                      <textarea
                        {...register(`hiddenTestCases.${index}.output`)}
                        placeholder="Expected output"
                        className="textarea textarea-bordered w-full font-mono text-sm"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Code Templates */}
        <div className="card bg-base-100 shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Code Templates</h2>
          
          <div className="tabs tabs-boxed mb-4">
            {['C++', 'Java', 'JavaScript'].map((lang, index) => (
              <button
                key={lang}
                type="button"
                className={`tab ${index === 0 ? 'tab-active' : ''}`}
                onClick={() => document.getElementById(`lang-${index}`)?.scrollIntoView()}
              >
                {lang}
              </button>
            ))}
          </div>
          
          <div className="space-y-8">
            {[0, 1, 2].map((index) => (
              <div key={index} id={`lang-${index}`} className="space-y-4">
                <h3 className="font-medium text-lg">
                  {index === 0 ? 'C++' : index === 1 ? 'Java' : 'JavaScript'}
                </h3>
                
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Initial Code</span>
                    </label>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-base-300 px-4 py-2 font-mono text-sm">
                        {index === 0 ? 'C++' : index === 1 ? 'Java' : 'JavaScript'} Starter Code
                      </div>
                      <textarea
                        {...register(`startCode.${index}.initialCode`)}
                        className="w-full bg-base-100 p-4 font-mono text-sm focus:outline-none"
                        rows={8}
                        spellCheck="false"
                      />
                    </div>
                  </div>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Reference Solution</span>
                    </label>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-base-300 px-4 py-2 font-mono text-sm">
                        {index === 0 ? 'C++' : index === 1 ? 'Java' : 'JavaScript'} Solution
                      </div>
                      <textarea
                        {...register(`referenceSolution.${index}.completeCode`)}
                        className="w-full bg-base-100 p-4 font-mono text-sm focus:outline-none"
                        rows={8}
                        spellCheck="false"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 bg-base-100 py-4 border-t">
          <button type="submit" className="btn btn-primary w-full gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Problem
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminPanel;