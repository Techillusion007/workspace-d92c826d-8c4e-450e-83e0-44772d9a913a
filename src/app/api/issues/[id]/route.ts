import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch single issue
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const issue = await db.issue.findUnique({
      where: { id },
      include: {
        screenshots: {
          orderBy: { uploadedAt: 'asc' }
        }
      }
    });

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    return NextResponse.json({
      issue: {
        ...issue,
        stepsToReproduce: JSON.parse(issue.stepsToReproduce),
        createdAt: issue.createdAt.toISOString(),
        updatedAt: issue.updatedAt.toISOString(),
        screenshots: issue.screenshots.map(ss => ({
          ...ss,
          uploadedAt: ss.uploadedAt.toISOString()
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching issue:', error);
    return NextResponse.json({ error: 'Failed to fetch issue' }, { status: 500 });
  }
}

// PUT - Update issue
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      title, 
      description, 
      severity, 
      status, 
      type, 
      screen, 
      stepsToReproduce, 
      expectedBehavior, 
      actualBehavior, 
      environment, 
      device, 
      osVersion, 
      appVersion, 
      reportedBy, 
      assignedTo, 
      notes,
      screenshots
    } = body;

    // Update issue
    const issue = await db.issue.update({
      where: { id },
      data: {
        title,
        description: description || '',
        severity: severity || 'medium',
        status: status || 'open',
        type: type || 'bug',
        screen: screen || '',
        stepsToReproduce: JSON.stringify(stepsToReproduce || []),
        expectedBehavior: expectedBehavior || '',
        actualBehavior: actualBehavior || '',
        environment: environment || 'Production',
        device: device || '',
        osVersion: osVersion || '',
        appVersion: appVersion || '',
        reportedBy: reportedBy || '',
        assignedTo: assignedTo || '',
        notes: notes || ''
      },
      include: {
        screenshots: true
      }
    });

    // Handle screenshot updates if provided
    if (screenshots !== undefined) {
      // Delete existing screenshots
      await db.issueScreenshot.deleteMany({
        where: { issueId: id }
      });

      // Create new screenshots
      if (screenshots.length > 0) {
        await db.issueScreenshot.createMany({
          data: screenshots.map((ss: { name: string; data: string; type: string; size: number }) => ({
            issueId: id,
            name: ss.name,
            data: ss.data,
            type: ss.type,
            size: ss.size
          }))
        });
      }

      // Refetch issue with new screenshots
      const updatedIssue = await db.issue.findUnique({
        where: { id },
        include: { screenshots: true }
      });

      if (updatedIssue) {
        return NextResponse.json({
          issue: {
            ...updatedIssue,
            stepsToReproduce: JSON.parse(updatedIssue.stepsToReproduce),
            createdAt: updatedIssue.createdAt.toISOString(),
            updatedAt: updatedIssue.updatedAt.toISOString(),
            screenshots: updatedIssue.screenshots.map(ss => ({
              ...ss,
              uploadedAt: ss.uploadedAt.toISOString()
            }))
          }
        });
      }
    }

    return NextResponse.json({
      issue: {
        ...issue,
        stepsToReproduce: JSON.parse(issue.stepsToReproduce),
        createdAt: issue.createdAt.toISOString(),
        updatedAt: issue.updatedAt.toISOString(),
        screenshots: issue.screenshots.map(ss => ({
          ...ss,
          uploadedAt: ss.uploadedAt.toISOString()
        }))
      }
    });
  } catch (error) {
    console.error('Error updating issue:', error);
    return NextResponse.json({ error: 'Failed to update issue' }, { status: 500 });
  }
}

// DELETE - Delete issue
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete issue (screenshots will cascade delete)
    await db.issue.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting issue:', error);
    return NextResponse.json({ error: 'Failed to delete issue' }, { status: 500 });
  }
}
