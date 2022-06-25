import { App } from "../../../../../types";
import Route from "../../../../../types/route";
import { APIGatewayEvent } from "aws-lambda";
import response from "../../../../../utils/response";
import { parseObjectId } from "../../../../../utils/parser";
import { StartKeyPhrasesDetectionJobCommand, DetectKeyPhrasesCommand } from "@aws-sdk/client-comprehend";

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

  if (status.incomplete === 0 && !status.analyzed && !note.comprehendJobId) {
    const contents = note.files.map(file => file.textractContent).join("\n");

    const comprehendCommand = new DetectKeyPhrasesCommand({
      Text: contents,
      LanguageCode: "en",
    });

    const comprehendResult = await app.comprehend.send(comprehendCommand);

    const success = await app.db.updateNote(noteId, {
      keyPhrases: comprehendResult.KeyPhrases,
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
