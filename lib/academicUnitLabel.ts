/**
 * Several institutions' prospectuses don't publish named sub-schools, so
 * their School records fall back to mirroring the parent Faculty's name
 * 1:1 (see config/tutProgrammes.seed.ts and others). Rendering both names
 * side by side then shows the same text twice ("Faculty of X · Faculty of
 * X"), which reads as a data bug to a learner even though it isn't one.
 */
export function academicUnitLabel(faculty: { name: string }, school: { name: string }): string {
  return faculty.name === school.name ? faculty.name : `${faculty.name} · ${school.name}`;
}
