import { Router } from "express";
import type {Request , Response} from "express";
import { courses, students } from "../db/db.js";
import {
  zStudentId,
} from "../schemas/studentValidator.js";
import { type Course} from "../libs/types.js";

const router = Router();

router.get("/",(req : Request , res: Response) => {
  try {
    const program = req.query.program;

    if (program) {
      let filtered_students = students.filter(
        (student) => student.program === program
      );
      return res.status(200).json({
        success: true,
        data: filtered_students,
      });
    } else {
      return res.status(200).json({
        success: true,
        data: students,
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

router.get("/:studentId", (req : Request , res : Response)=>{
  try {
    const studentId = req.params.studentId;
    const result = zStudentId.safeParse(studentId);
    

    // validate req.body with predefined validator
    // check zod
    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    //check duplicate studentId
    const foundIndex = students.findIndex(
      (student) => student.studentId === studentId
    );

    if (foundIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Student does not exists",
      });
    }

    // update student data
    

    // add response header 'Link'
    res.set("Link", `/students/${studentId}`);

    return res.json({
      success: true,
      message: `Successfully`,
      data: students[foundIndex],
    });
  } catch (err) {
    return res.json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

router.get("/:studentId/courses", (req : Request , res : Response)=>{
  try {
    const studentId = req.params.studentId;
    const result = zStudentId.safeParse(studentId);
    
    

    // validate req.body with predefined validator
    // check zod
    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    //check duplicate studentId
    const foundIndex = students.findIndex(
      (student) => student.studentId === studentId
    );

    if (foundIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Student does not exists",
      });
    }

    const courseRegistered = students[foundIndex]?.courses?.map((courseID)=>
        courses.find((course)=>course.courseId===courseID)).filter((c): c is Course => c!==undefined)??[];
       
   

    const cleanedCourses = courseRegistered.map(({ instructors, ...rest }) => rest);

    // add response header 'Link'
    res.set("Link", `/students/${studentId}`);

    return res.json({
      success: true,
      message: `Get courses detail of student ${studentId}`,
      data:{
        studentId:`${studentId}`,
        courses:cleanedCourses,
      },
    });
  } catch (err) {
    return res.json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

export default router;
