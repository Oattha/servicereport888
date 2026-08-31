import { useRef, useState } from "react";
import { searchProjects } from "../services/projectApi";

export default function ProjectAutocomplete({
  authToken,
  value,
  onChange,
  onBlur,
  onSelectProject,
  className,
}) {
  const [projects, setProjects] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const requestIdRef = useRef(0);
  const searchTimerRef = useRef(null);

  const loadProjects = async (query) => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setLoadError("");
    try {
      const result = await searchProjects(authToken, query);
      if (requestId === requestIdRef.current) {
        setProjects(result);
      }
    } catch (error) {
      if (requestId === requestIdRef.current) {
        setProjects([]);
        setLoadError(error.message);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  };

  const scheduleSearch = (query) => {
    window.clearTimeout(searchTimerRef.current);
    searchTimerRef.current = window.setTimeout(() => {
      loadProjects(query);
    }, 220);
  };

  const handleChange = (event) => {
    onChange(event);
    setIsOpen(true);
    scheduleSearch(event.target.value);
  };

  const handleFocus = () => {
    setIsOpen(true);
    loadProjects(value);
  };

  const handleBlur = (event) => {
    window.setTimeout(() => setIsOpen(false), 120);
    onBlur?.(event);
  };

  const handleSelect = (project) => {
    window.clearTimeout(searchTimerRef.current);
    setIsOpen(false);
    onSelectProject(project);
  };

  return (
    <div className="relative">
      <input
        type="text"
        name="projectName"
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={className}
        autoComplete="off"
        placeholder="พิมพ์หรือเลือกโครงการที่เคยใช้"
        aria-expanded={isOpen}
        aria-autocomplete="list"
      />

      {isOpen && (
        <div className="absolute z-40 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-blue-200 bg-white p-2 shadow-xl">
          {isLoading && (
            <p className="px-3 py-4 text-sm text-slate-500">
              กำลังค้นหาโครงการ...
            </p>
          )}

          {!isLoading && loadError && (
            <p className="px-3 py-4 text-sm text-red-600">{loadError}</p>
          )}

          {!isLoading && !loadError && projects.length === 0 && (
            <p className="px-3 py-4 text-sm text-slate-500">
              ยังไม่มีโครงการที่บันทึกไว้
            </p>
          )}

          {!isLoading &&
            projects.map((project) => (
              <button
                key={project.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(project)}
                className="block w-full rounded-xl px-4 py-3 text-left transition hover:bg-blue-50"
              >
                <span className="block font-bold text-slate-900">
                  {project.project_name}
                </span>
                {project.address && (
                  <span className="mt-1 block truncate text-sm text-slate-500">
                    {project.address}
                  </span>
                )}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
