import type { Lo, Topic } from "$lib/services/models/lo-types";
import { LabSheet } from "./lab-sheet";
import { deepScheme } from "./heat-map-colours";
import type { UserMetric } from "$lib/services/types/metrics";

export class TopicCountSheet extends LabSheet {
  title = "Tutors Time";
  subtitle = "Number of minutes a topic is active";

  populateCols(topics: Lo[]) {
    topics.forEach((topic) => {
      this.columnDefs.push({
        headerName: topic.title,
        width: 48,
        field: topic.title,
        suppressSizeToFit: true,
        cellClassRules: deepScheme,
        menuTabs: []
      });
    });
  }

  populateRow(user: UserMetric, topics: Lo[]) {
    const row = this.creatRow(user);
    this.zeroEntries(topics, row);
    let summaryCount = 0;
    user.topicActivity.forEach((topicMetric) => {
      let labSummaryCount = 0;
      if (topicMetric) {
          if (topicMetric.count) labSummaryCount = labSummaryCount + topicMetric.count;
        labSummaryCount = Math.round(labSummaryCount / 2);
        row[`${topicMetric.title}`] = labSummaryCount;
      }
      summaryCount = summaryCount + labSummaryCount;
    });

    row.summary = summaryCount;
    this.rowData.push(row);
  }
}
