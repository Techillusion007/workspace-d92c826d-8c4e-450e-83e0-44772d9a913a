import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch all issues
export async function GET() {
  try {
    const issues = await db.issue.findMany({
      include: {
        screenshots: {
          orderBy: { uploadedAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform to match frontend format
    const transformedIssues = issues.map(issue => ({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      severity: issue.severity,
      status: issue.status,
      type: issue.type,
      screen: issue.screen,
      stepsToReproduce: JSON.parse(issue.stepsToReproduce),
      expectedBehavior: issue.expectedBehavior,
      actualBehavior: issue.actualBehavior,
      environment: issue.environment,
      device: issue.device,
      osVersion: issue.osVersion,
      appVersion: issue.appVersion,
      reportedBy: issue.reportedBy,
      assignedTo: issue.assignedTo,
      notes: issue.notes,
      createdAt: issue.createdAt.toISOString(),
      updatedAt: issue.updatedAt.toISOString(),
      screenshots: issue.screenshots.map(ss => ({
        id: ss.id,
        name: ss.name,
        data: ss.data,
        type: ss.type,
        size: ss.size,
        uploadedAt: ss.uploadedAt.toISOString()
      }))
    }));

    return NextResponse.json({ issues: transformedIssues });
  } catch (error) {
    console.error('Error fetching issues:', error);
    return NextResponse.json({ error: 'Failed to fetch issues' }, { status: 500 });
  }
}

// POST - Create new issue
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id, 
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

    // Create issue with screenshots
    const issue = await db.issue.create({
      data: {
        id: id || undefined,
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
        notes: notes || '',
        screenshots: {
          create: (screenshots || []).map((ss: { name: string; data: string; type: string; size: number }) => ({
            name: ss.name,
            data: ss.data,
            type: ss.type,
            size: ss.size
          }))
        }
      },
      include: {
        screenshots: true
      }
    });

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
    console.error('Error creating issue:', error);
    return NextResponse.json({ error: 'Failed to create issue' }, { status: 500 });
  }
}
