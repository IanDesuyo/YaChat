import { App } from "../../../../../types";
import Route from "../../../../../types/route";
import { APIGatewayEvent } from "aws-lambda";
import response from "../../../../../utils/response";
import { parseObjectId } from "../../../../../utils/parser";
import { DetectKeyPhrasesCommand } from "@aws-sdk/client-comprehend";

const GET = async (app: App, event: APIGatewayEvent) => {
  const lessonId = parseObjectId(event.pathParameters.lessonId);
  const noteId = parseObjectId(event.pathParameters.noteId);

  const note = await app.db.getNote(noteId);

  if (!note) {
    return response(404, {
      message: "not found",
      i18n: "note.notFound",
    });
  }

  const status = {
    incomplete: 0,
    completed: 0,
    analyzed: !!note.keyPhrases,
  };

  for (const file of note.files) {
    status[file.textractResult ? "completed" : "incomplete"]++;
  }

  if (status.incomplete === 0 && !status.analyzed) {
    const contents = note.files.map(file => file.textractContent).join("\n");

    const comprehendCommand = new DetectKeyPhrasesCommand({
      Text: contents,
      LanguageCode: "en",
    });

    const comprehendResult = await app.comprehend.send(comprehendCommand);

    // Find all key phrases with a confidence of at least 50% and remove duplicates
    const texts: string[] = [];
    const keyPhrases = comprehendResult.KeyPhrases.sort((a, b) => b.Score - a.Score)
      .map(kp => {
        const text = kp.Text.toLowerCase();

        if (!texts.includes(text)) {
          texts.push(text);
          return { text, score: kp.Score };
        }
      })
      .filter(Boolean);

    const success = await app.db.updateNote(noteId, {
      keyPhrases,
    });

    if (!success) {
      return response(500, {
        message: "failed to update",
        i18n: "note.update.failed",
      });
    }

    status.analyzed = true;
  }

  return response(200, {
    message: "success",
    i18n: "notes.get.success",
    data: status,
  });
};

export default {
  GET,
} as Route;
