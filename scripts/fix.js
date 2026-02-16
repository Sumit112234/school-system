import fs from "fs";

const input = JSON.parse(
  fs.readFileSync("./scripts/seed-data/students.json", "utf-8")
);

const output = input.map(u => {
  const {
    enrollmentNumber,
    classId,
    userId,
    ...rest
  } = u;

  return {
    ...rest,
    studentId: enrollmentNumber,
    class: classId,
    user: userId
  };
});

fs.writeFileSync(
  "./scripts/seed-data/students-output.json",
  JSON.stringify(output, null, 2)
);
