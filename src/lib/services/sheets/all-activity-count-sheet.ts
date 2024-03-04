import type { Lo, Topic } from "$lib/services/models/lo-types";
import { LabSheet } from "./lab-sheet";
import { deepScheme } from "./heat-map-colours";
import type { UserMetric } from "$lib/services/types/metrics";

export class AllActivityCountSheet extends LabSheet {
  title = "Tutors Time";
  subtitle = "Number of minutes all activities is active";

  populateCols(activities: any) {
    activities.forEach((activity) => {
      this.columnDefs.push({
        headerName: activity,
        width: 48,
        field: activity,
        suppressSizeToFit: true,
        cellClassRules: deepScheme,
        menuTabs: []
      });
    });
  }

   populateRow(user: UserMetric, activities: Lo[]) {
    const row = this.creatRow(user);
    this.zeroEntries(activities, row);
    let summaryCount = 0;
    user.topics.forEach((topicMetric) => {
      let labSummaryCount = 0;
      if (topicMetric) {
          if (topicMetric.total_duration) labSummaryCount = labSummaryCount + topicMetric.total_duration;
        labSummaryCount = Math.round(labSummaryCount / 2);
        row[`${topicMetric.lo_title}`] = labSummaryCount;
      }
      summaryCount = summaryCount + labSummaryCount;
    });

    row.summary = summaryCount;
    this.rowData.push(row);
  }
}

