import { NextResponse } from "next/server";
import { getLastUnreadEmail, sendEmail } from "@/lib/email";
import { readerAgent } from "@/agents/reader_agent";
import { classifierAgent } from "@/agents/classifier_agent";
import { responseAgent } from "@/agents/response_agent";
import { criticAgent, type CriticAgentResult } from "@/agents/critic_agent";
import { reviseAgent } from "@/agents/revise_agent";
import { log } from "@/lib/logger";

const MAX_REVISIONS = 2;

export async function POST() {
  try {
    const startedAt = Date.now();
    log({ event: "pipeline.start" });

    const email = await getLastUnreadEmail();
    if (!email) {
      log({
        event: "pipeline.no_unread_email"
      });
      return NextResponse.json(
        { message: "No unread emails found" },
        { status: 200 }
      );
    }

    const timings: Record<string, number> = {};

    const t0Reader = Date.now();
    const summary = await readerAgent(email.text);
    timings.readerMs = Date.now() - t0Reader;
    log({
      event: "agent.reader.done",
      data: { durationMs: timings.readerMs }
    });

    const t0Classifier = Date.now();
    const classification = await classifierAgent(summary);
    timings.classifierMs = Date.now() - t0Classifier;
    log({
      event: "agent.classifier.done",
      data: { durationMs: timings.classifierMs, classification }
    });

    const t0Response = Date.now();
    let response = await responseAgent(email.text, summary);
    timings.responseMs = Date.now() - t0Response;
    log({
      event: "agent.response.done",
      data: {
        durationMs: timings.responseMs,
        extractedUsername: response.username,
        extractedOrderNumber: response.orderNumber
      }
    });

    const t0Critic = Date.now();
    let critic = await criticAgent({
      emailText: email.text,
      summary,
      classification,
      response
    });
    timings.criticMs = Date.now() - t0Critic;
    log({
      event: "agent.critic.done",
      data: {
        durationMs: timings.criticMs,
        approved: critic.approved
      }
    });

    const revisions: CriticAgentResult[] = [];

    let revisionCount = 0;
    while (!critic.approved && revisionCount < MAX_REVISIONS) {
      revisionCount += 1;
      log({
        event: "pipeline.revision.start",
        data: {
          revisionCount,
          critique: critic.critique
        }
      });

      const t0Revise = Date.now();
      response = await reviseAgent({
        emailText: email.text,
        summary,
        classification,
        previousResponse: response,
        critic
      });
      const reviseKey = `revise${revisionCount}Ms`;
      timings[reviseKey] = Date.now() - t0Revise;
      log({
        event: "agent.revise.done",
        data: {
          revisionCount,
          durationMs: timings[reviseKey],
          extractedUsername: response.username,
          extractedOrderNumber: response.orderNumber
        }
      });

      const t0CriticRev = Date.now();
      critic = await criticAgent({
        emailText: email.text,
        summary,
        classification,
        response
      });
      const criticRevKey = `criticRevision${revisionCount}Ms`;
      timings[criticRevKey] = Date.now() - t0CriticRev;

      revisions.push(critic);

      log({
        event: "agent.critic.revision_done",
        data: {
          revisionCount,
          durationMs: timings[criticRevKey],
          approved: critic.approved
        }
      });
    }

    if (!critic.approved) {
      log({
        event: "pipeline.critic_rejected_final",
        data: {
          critique: critic.critique,
          revisionCount
        }
      });
      return NextResponse.json(
        {
          message:
            "Critic did not approve the reply after revisions. Email not sent.",
          critic,
          revisions,
          timings,
          totalDurationMs: Date.now() - startedAt
        },
        { status: 200 }
      );
    }

    const toAddress = email.from;
    const t0Send = Date.now();
    await sendEmail(toAddress, `Re: ${email.subject}`, response.reply);
    timings.sendMs = Date.now() - t0Send;
    const totalDurationMs = Date.now() - startedAt;

    log({
      event: "pipeline.reply_sent",
      data: {
        to: toAddress,
        classification,
        totalDurationMs,
        timings
      }
    });

    return NextResponse.json(
      {
        message: "Reply sent successfully",
        summary,
        classification,
        response,
        critic,
        revisions,
        timings,
        totalDurationMs
      },
      { status: 200 }
    );
  } catch (error: any) {
    log({
      event: "pipeline.error",
      level: "error",
      data: {
        message: error?.message,
        stack: error?.stack
      }
    });
    return NextResponse.json(
      { error: error.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

