import { Router } from "express";
import type {Request , Response} from "express";
import { courses } from "../db/db.js";
import {
    zCourseId,
    zCoursePostBody,
    zCoursePutBody,
    zCourseDeleteBody,
} from "../schemas/courseValidator.js"
import type { Course } from "../libs/types.js";
const router: Router = Router();

// READ all
router.get("/",(req:Request,res:Response) => {
    try {
        return res.status(200).json({
            success: true,
            data: courses,
        })
    }catch(err){
        return res.status(500).json({
        success: false,
        message: "Something is wrong, please try again",
        error: err,
    });
    }
});

// Params URL 
router.get("/:courseId",(req:Request,res:Response)=>{
    try{
        const courseId = Number(req.params.courseId);
        const result = zCourseId.safeParse(courseId);
        
        if(!result.success){
            return res.status(400).json({
                message: "Validation failed",
                errors: result.error.issues[0]?.message,
            })
        }

        const foundIndex = courses.findIndex(
            (course) => course.courseId === courseId
        );

        if(foundIndex===-1){
            return res.status(404).json({
            success: false,
            message: "Course does not exists",
        });            
        }

        return res.status(200).json({
            success: true,
            message: `Get course ${courseId} successfully`,
            data: courses[foundIndex],
        });
    }catch(err){
        return res.json({
            success: false,
            messafe:"Somthing is wrong, please try again",
            error: err,
        });
    }
});


router.post("/", (req:Request,res:Response) => {
    try{
        const body = req.body as Course;

        const result = zCoursePostBody.safeParse(body);

        if(!result.success){
            return res.status(400).json({
                message: "Validation failed",
                errors: result.error.issues[0]?.message,
            });
        }

        const found = courses.find(
            (course)=> course.courseId===body.courseId
        );
        if(found){
            return res.status(409).json({
                success: false,
                message: "Course Id already exists",
            });
        }
        const new_course = body;
        courses.push(new_course);
        res.set("Link", `/courses/${new_course.courseId}`);

        return res.status(201).json({
            success: true,
            message: `Course ${body.courseId} has been added successfully`,
            data:{
                courseId: body.courseId,
                courseTitle: body.courseTitle,
                instructors: body.instructors,
            }
        })

    }catch(err){
        return res.json({
            success: false,
            messafe:"Somthing is wrong, please try again",
            error: err,
        });
    }
});

router.put("/", (req:Request,res:Response) => {
    try{
        const body = req.body as Course;

        const result = zCoursePutBody.safeParse(body);

        if(!result.success){
            res.status(400).json({
                message:"Validation failed",
                errors: result.error.issues[0]?.message,
            });
        }
        const foundIndex = courses.findIndex(
            (course)=> course.courseId===body.courseId
        );

        if(foundIndex===-1){
            return res.status(404).json({
                success: false,
                message: " Course Id does not exists",
            })
        }

        courses[foundIndex] = { ...courses[foundIndex], ...body};    
        
        return res.status(200).json({
            success:true,
            message: `course ${body.courseId} has been updated successfully`, 
            data: courses[foundIndex],        
        })
    }catch(err){
        return res.json({
            success: false,
            messafe:"Somthing is wrong, please try again",
            error: err,
        });
    }

}); 

router.delete("/",(req:Request,res:Response) => {
    try{
        const body = req.body;
        const result = zCourseDeleteBody.safeParse(body);

        if(!result.success){
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                error: result.error.issues[0]?.message,
            })
        }
        const foundIndex = courses.findIndex(
            (course) => course.courseId === body.courseId,
        )
        if(foundIndex===-1){
            return res.status(404).json({
                success: false,
                message: "Course Id does not exists",
            })
        }
        const temp = courses[foundIndex];

        courses.splice(foundIndex,1);

        res.status(200).json({
            success:true,
            message:`Course ${body.courseId} has been deleted successfully`,
            data:temp,
        });
    }catch(err){
        return res.json({
            success: false,
            messafe:"Somthing is wrong, please try again",
            error: err,
        });  
    }

});

export default router;
