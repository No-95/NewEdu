import type { LectureMetadata } from '@/lib/models/lecture';

export interface ParsedVideoFolderName {
  unit: number;
  lecture: number;
}

export interface CourseLectureOutline extends LectureMetadata, ParsedVideoFolderName {}

export interface CourseUnitOutline {
  unit: number;
  lectures: CourseLectureOutline[];
}

export function parseVideoFolderName(folderName: string): ParsedVideoFolderName {
  const normalizedFolderName = folderName.trim();
  const [unitPart, lecturePart, ...extraParts] = normalizedFolderName.split('-');

  if (!unitPart || !lecturePart || extraParts.length > 0) {
    throw new Error(`Invalid video folder name: ${folderName}`);
  }

  const unit = Number.parseInt(unitPart, 10);
  const lecture = Number.parseInt(lecturePart, 10);

  if (!Number.isInteger(unit) || !Number.isInteger(lecture) || unit < 1 || lecture < 1) {
    throw new Error(`Invalid video folder name: ${folderName}`);
  }

  return { unit, lecture };
}

export function compareVideoFolderNames(leftFolderName: string, rightFolderName: string): number {
  const left = parseVideoFolderName(leftFolderName);
  const right = parseVideoFolderName(rightFolderName);

  if (left.unit !== right.unit) {
    return left.unit - right.unit;
  }

  return left.lecture - right.lecture;
}

export function groupLecturesByUnit(lectures: LectureMetadata[]): CourseUnitOutline[] {
  const unitMap = new Map<number, CourseLectureOutline[]>();

  for (const lecture of lectures) {
    const { unit, lecture: lectureNumber } = parseVideoFolderName(lecture.videoFolderName);
    const enhancedLecture: CourseLectureOutline = {
      ...lecture,
      unit,
      lecture: lectureNumber,
    };

    const existingLectures = unitMap.get(unit);
    if (existingLectures) {
      existingLectures.push(enhancedLecture);
    } else {
      unitMap.set(unit, [enhancedLecture]);
    }
  }

  return Array.from(unitMap.entries())
    .sort(([leftUnit], [rightUnit]) => leftUnit - rightUnit)
    .map(([unit, groupedLectures]) => ({
      unit,
      lectures: groupedLectures.sort((left, right) => left.lecture - right.lecture),
    }));
}
