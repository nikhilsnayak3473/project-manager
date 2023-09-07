import { Autobind } from "../decorartors/autobind";
import { DragTarget } from "../models/drag-drop";
import { Project, ProjectStatus } from "../models/project";
import { projectState } from "../state/project";
import { Component } from "./base";
import { ProjectItem } from "./project-item";

export class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  assignedProjects: Project[] = [];

  constructor(public type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`);
    this.configure();
    this.renderContent();
  }

  @Autobind
  dragOverHandler(e: DragEvent): void {
    if (e.dataTransfer && e.dataTransfer!.types[0] === "text/plain") {
      e.preventDefault();
      const listElement = this.element.querySelector("ul")!;
      listElement.classList.add("droppable");
    }
  }

  @Autobind
  dropHandler(e: DragEvent): void {
    const projectId = e.dataTransfer!.getData("text/plain");
    projectState.moveProject(
      projectId,
      this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished
    );
  }

  @Autobind
  dragLeaveHandler(_: DragEvent): void {
    const listElement = this.element.querySelector("ul")!;
    listElement.classList.remove("droppable");
  }

  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent =
      this.type.toUpperCase() + " PROJECTS";
  }

  configure(): void {
    this.element.addEventListener("dragover", this.dragOverHandler);
    this.element.addEventListener("dragleave", this.dragLeaveHandler);
    this.element.addEventListener("drop", this.dropHandler);

    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter((project) => {
        if (this.type === "active") {
          return project.status === ProjectStatus.Active;
        }
        return project.status === ProjectStatus.Finished;
      });

      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });
  }

  private renderProjects() {
    const listElement = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    listElement.innerHTML = "";
    for (const projectItem of this.assignedProjects) {
      new ProjectItem(this.element.querySelector("ul")!.id, projectItem);
    }
  }
}
