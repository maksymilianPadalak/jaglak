import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export async function createTask(req: Request, res: Response) {
  try {
    const { title } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
      },
    });

    return res.status(201).json(task);
  } catch (error) {
    console.error('[Task] Error creating task:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to create task',
    });
  }
}

export async function getTasks(req: Request, res: Response) {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.json(tasks);
  } catch (error) {
    console.error('[Task] Error fetching tasks:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch tasks',
    });
  }
}

export async function updateTask(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    if (typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'Completed must be a boolean' });
    }

    const task = await prisma.task.update({
      where: { id },
      data: { completed },
    });

    return res.json(task);
  } catch (error) {
    console.error('[Task] Error updating task:', error);
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return res.status(404).json({ error: 'Task not found' });
    }
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to update task',
    });
  }
}

